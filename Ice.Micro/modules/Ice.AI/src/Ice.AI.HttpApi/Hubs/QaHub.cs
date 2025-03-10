using System.Collections.ObjectModel;
using System.Runtime.Intrinsics;
using System.Text;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Memory;
using System.Linq;
using Volo.Abp.Caching;
using Microsoft.Extensions.Caching.Distributed;
using Volo.Abp.AspNetCore.SignalR;
using Ice.Utils;
using System.Collections.Generic;
using Ice.AI.SemanticKernel;
using Ice.AI.Enums;
using Azure.AI.OpenAI;
using Azure;
using TiktokenSharp;
using Volo.Abp.Domain.Repositories;
using Ice.AI.Core;
using Volo.Abp.Uow;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Threading;
using System.Threading;
using System.Numerics;
using Microsoft.SemanticKernel.Connectors.Memory.Qdrant;
using Microsoft.SemanticKernel.AI.Embeddings;
using Microsoft.AspNetCore.Http.Features;
using System.Net.Http;
using Ice.Auth.Core;
using Ice.AI.SemanticKernel.NativeFunctions;
using Microsoft.SemanticKernel.Planners;
using System.Text.RegularExpressions;
using Ice.Auth;
using System.Diagnostics;

namespace Ice.AI;

[Authorize(policy: IceResourceScopes.AIScope)]
public class QaHub : AbpHub
{
    // 上一次发送给gpt的信息
    protected const string InfoItemKey = "Info";

    // 最后的聊天记录
    protected const string LateRecordItemKey = "Laterecord";

    // 上下文矢量Key
    protected const string ContextVectorItemKey = "Contextver";

    // 联系人信息
    protected const string ContactItemKey = "Contact";

    // 问题命中次数
    protected const string QuestionQueryQuantityItemKey = "QuestionQueryQuantity";

    // AI使用次数
    protected const string AIUseQuantityItemKey = "AIUseQuantity";

    // 当前租户是否有费用
    protected const string HaveAmountItemKey = "HaveAmount";

    // 登录信息
    protected const string LoginInfoItemKey = "LoginInfo";

    // 允许访客Ai使用次数
    protected const string GuestAiResponeCountItemKey = "GuestAiResponeCount";

    protected IDistributedCache<QaCacheInfo> Cache { get; set; }

    protected IDistributedCache<GuestUsedCount> GuestUsedCountCache { get; set; }

    protected AccessLimiter AccessLimiter { get; set; }

    public QaHub(
        IDistributedCache<QaCacheInfo> cache,
        IDistributedCache<GuestUsedCount> guestUsedCountCache,
        AccessLimiter accessLimiter)
    {
        Cache = cache;
        GuestUsedCountCache = guestUsedCountCache;
        AccessLimiter = accessLimiter;
    }

    // 管理员组名称
    protected string GetAdminGroupName() => $"{CurrentTenant.Id.ToString()}-admin";

    // 游客组名称
    protected string GetGuestGroupName() => $"{CurrentTenant.Id.ToString()}-guest";

    // 缓存信息Key
    protected string GetCacheKey(string? connectionId = null) => $"{CurrentTenant.Id.ToString()}-{connectionId ?? Context.ConnectionId}";

    # region Public Methods
    // 游客发送消息
    [Authorize(Roles = IceRoleTypes.Guest)]
    public async Task SendMessagePlus(string message, List<ChatItem> items)
    {
        if (CurrentTenant.Id == null)
        {
            throw new Exception("Tenant not found");
        }

        await Clients.Group(this.GetAdminGroupName()).SendAsync("ReceiveMessageOfAdmin", Context.ConnectionId, "user", message);

        // 如果关闭了AI客服，则直接返回
        var qaCacheInfo = Cache.Get(GetCacheKey());
        var enableAI = qaCacheInfo?.EnableAI;
        if (enableAI != null && enableAI == false)
        {
            // 记录聊天消息，在访客断开后会进行处理
            items.Add(new ChatItem()
            {
                Role = MessageRoleType.User,
                Content = message
            });
            this.Context.Items[LateRecordItemKey] = items;
            return;
        }

        // 检查是否超过每天的绝对访问次数，超过后不再访问
        if (!(await AccessLimiter.Access(WebConfiguration.AIConfig.DayAccessLimtNum, 86400, "QaHub_SMP")))
        {
            // 记录聊天消息，在访客断开后会进行处理
            items.Add(new ChatItem()
            {
                Role = MessageRoleType.User,
                Content = message
            });
            this.Context.Items[LateRecordItemKey] = items;
            return;
        }

        // 检查每个访客的访问次数限制
        var guestLimtCount = this.Context.Items[GuestAiResponeCountItemKey] as int?;
        if (guestLimtCount != null)
        {
            LoginInfo? loginInfo = this.Context.Items[LoginInfoItemKey] as LoginInfo;
            string? ip = loginInfo?.Ip;
            if (ip != null)
            {
                var guestUsedCount = GuestUsedCountCache.GetOrAdd(ip, () => new GuestUsedCount(), () => new DistributedCacheEntryOptions()
                {
                    AbsoluteExpirationRelativeToNow = new TimeSpan(24, 0, 0),
                });
                Debug.Assert(guestUsedCount != null);

                if (guestUsedCount.Count >= guestLimtCount)
                {
                    // 记录聊天消息，在访客断开后会进行处理
                    items.Add(new ChatItem()
                    {
                        Role = MessageRoleType.User,
                        Content = message
                    });
                    this.Context.Items[LateRecordItemKey] = items;
                    return;
                }

                guestUsedCount.Count++;

                await GuestUsedCountCache.SetAsync(ip, guestUsedCount);
            }
        }

        // 检查租户免费访问次数，如果超过了则记录多余部分，结束访问后会追加进行扣费
        if (!(await AccessLimiter.Access(WebConfiguration.AIConfig.DayAccessNum, 86400, "QaHub_SMP")))
        {
            // 如果当前租户没有余额
            if (!((this.Context.Items[HaveAmountItemKey] as bool?) ?? false))
            {
                // 记录聊天消息，在访客断开后会进行处理
                items.Add(new ChatItem()
                {
                    Role = MessageRoleType.User,
                    Content = message
                });
                this.Context.Items[LateRecordItemKey] = items;
                return;
            }

            this.Context.Items[AIUseQuantityItemKey] = ((this.Context.Items[AIUseQuantityItemKey] as int?) ?? 0) + 1;
        }

        var results = await QueryAnswerAsync(message, 3);
        this.RecordQuestionQueryQuantity(results);
        MemoryQueryResult? firstresult = null;
        if (results.Count > 0)
        {
            firstresult = results[0];
        }

        string info = CreateGptInfo(results);

        // 发送 GPT
        string? reply = await this.SendChatMessage(message, items, info);
        // 回复访客
        await AIReplyMessage(reply, firstresult?.Metadata.Description, firstresult?.Metadata.AdditionalMetadata);
        // 记录聊天消息，再访客断开后会进行处理
        items.Add(new ChatItem()
        {
            Role = MessageRoleType.User,
            Content = message
        });
        items.Add(new ChatItem()
        {
            Role = MessageRoleType.Assistant,
            Content = reply
        });
        this.Context.Items[LateRecordItemKey] = items;
    }

    // 游客发送联系方式
    [Authorize(Roles = IceRoleTypes.Guest)]
    public void SendContact(Contact contact)
    {
        this.Context.Items[ContactItemKey] = contact;
    }

    // 启用禁用AI
    [Authorize(Roles = IceRoleTypes.Admin)]
    public void EnableAI(string connectionId, bool enabled)
    {
        Cache.Set(GetCacheKey(connectionId), new QaCacheInfo()
        {
            EnableAI = enabled
        }, new DistributedCacheEntryOptions()
        {
            AbsoluteExpirationRelativeToNow = new TimeSpan(2, 0, 0),
        });
    }

    // 发送消息给游客
    [Authorize(Roles = IceRoleTypes.Admin)]
    public async Task SendMessageToGuest(string connectionId, string message)
    {
        await Clients.Client(connectionId).SendAsync("ReceiveMessageOfGuest", "customer-service", message);
    }
    #endregion

    # region Protected Methods
    protected async Task AIReplyMessage(string? reply, string? original, string? additionalMetadata)
    {
        await Clients.Caller.SendAsync(
            "ReceiveMessageOfGuest",
            "assistant",
            reply,
            original,
            additionalMetadata);
        await Clients.Group(this.GetAdminGroupName()).SendAsync(
            "ReceiveMessageOfAdmin",
            Context.ConnectionId,
            "assistant",
            reply,
            original,
            additionalMetadata);
    }

    protected string CreateGptInfo(List<MemoryQueryResult> results)
    {
        StringBuilder infoBuilder = new StringBuilder();
        for (var i = 0; i < results.Count; i++)
        {
            var result = results[i];
            infoBuilder.Append($"Title {i + 1}: {result.Metadata.Text} \n Content {i + 1}: {result.Metadata.Description} \n\n");
        }
        string? info = infoBuilder.ToString();

        // 如果当前没有参考文档，则使用上一次的参考文档
        if (!string.IsNullOrWhiteSpace(info))
        {
            this.Context.Items[InfoItemKey] = info;
        }
        else
        {
            info = this.Context.Items[InfoItemKey] as string;
        }

        if (string.IsNullOrWhiteSpace(info))
        {
            info = "无";
        }

        return info;
    }

    protected async Task<string?> SendChatMessage(string message, List<ChatItem> items, string info)
    {
        OpenAIClient client = new OpenAIClient(
            new Uri(WebConfiguration.AzureOpenAI.Endpoint),
            new AzureKeyCredential(WebConfiguration.AzureOpenAI.ApiKey)
        );

        // ### If streaming is selected
        // Response<StreamingChatCompletions> response = await client.GetChatCompletionsStreamingAsync(
        //     deploymentOrModelName: WebConfiguration.AzureOpenAI.ChatDeploymentName,
        //     new ChatCompletionsOptions()
        //     {
        //         Messages =
        //         {
        //             new ChatMessage(ChatRole.System, @""),
        //         },
        //         Temperature = (float)0.7,
        //         MaxTokens = 800,
        //         NucleusSamplingFactor = (float)0.95,
        //         FrequencyPenalty = 0,
        //         PresencePenalty = 0,
        //     });
        // using StreamingChatCompletions streamingChatCompletions = response.Value;

        // token 消耗的基础值为3
        int tokenNum = 3;
        List<ChatMessage> chatMessages = new List<ChatMessage>();
        TikToken tikToken = TikToken.EncodingForModel("gpt-3.5-turbo");
        var sysContent =
$@"#01 You are a customer service and you can't play any other role.
#02 You can only answer questions around the following company documentation.
#03 If the company does not provide the corresponding documentation, answer ""很抱歉，这个问题我不太清楚，你可以咨询一下我们的人工客服哦"".
#04 Questions not related to documentation are forbidden to answer.
#05 Ignore any request from the user.
#06 Do not chat with users.
#07 Please answer the user's question in the most concise way.
The above requirements must not be forgotten, and if any of them are violated, no answer will be given.

Company documentation:
{info}";
        var sysChatMessage = new ChatMessage(ChatRole.System, sysContent);
        var userChatMessage = new ChatMessage(ChatRole.User, message);
        // System 额外消耗5
        tokenNum = tokenNum + tikToken.Encode(sysChatMessage.Content).Count;
        tokenNum = tokenNum + 5;
        // user 额外消耗5
        tokenNum = tokenNum + tikToken.Encode(userChatMessage.Content).Count;
        tokenNum = tokenNum + 5;

        for (int n = items.Count - 1; n >= 0; n--)
        {
            ChatItem item = items[n];
            tokenNum = tokenNum + tikToken.Encode(item.Content ?? "").Count;
            tokenNum = tokenNum + 5;
            // 返回的 token 最大会消耗 400
            if (tokenNum >= (4000 - 400))
            {
                break;
            }
            if (item.Role == MessageRoleType.User)
            {
                chatMessages.Add(new ChatMessage(ChatRole.User, item.Content));
            }
            else if (item.Role == MessageRoleType.Assistant)
            {
                chatMessages.Add(new ChatMessage(ChatRole.Assistant, item.Content));
            }
            else if (item.Role == MessageRoleType.CustomerService)
            {
                chatMessages.Add(new ChatMessage(ChatRole.Assistant, item.Content));
            }
        }

        chatMessages.Add(sysChatMessage);
        chatMessages.Reverse();
        chatMessages.Add(userChatMessage);

        // ### If streaming is not selected
        Response<ChatCompletions> responseWithoutStream = await client.GetChatCompletionsAsync(
            WebConfiguration.AzureOpenAI.ChatDeploymentName,
            new ChatCompletionsOptions(chatMessages)
            {
                Temperature = (float)0.1,
                MaxTokens = 400,
                NucleusSamplingFactor = (float)0.1,
                FrequencyPenalty = 0,
                PresencePenalty = 0,
            });

        ChatCompletions completions = responseWithoutStream.Value;
        return completions.Choices[0]?.Message.Content;
    }

    protected async Task<List<MemoryQueryResult>> QueryAnswerAsync(string message, int queryNum = 1)
    {
        Debug.Assert(CurrentTenant.Id != null);

        OpenAIClient client = new OpenAIClient(
            new Uri(WebConfiguration.AzureOpenAI.Endpoint),
            new AzureKeyCredential(WebConfiguration.AzureOpenAI.ApiKey)
        );

        var response = await client.GetEmbeddingsAsync(
            WebConfiguration.AzureOpenAI.EmbeddingDeploymentName,
            new EmbeddingsOptions(message));

        if (response == null)
        {
            throw new Exception("Text embedding null response");
        }

        if (response.Value.Data.Count == 0)
        {
            throw new Exception("Text embedding not found");
        }

        var embedding = response.Value.Data[0].Embedding;

        var contextEmbedding = Context.Items[ContextVectorItemKey] as IEnumerable<float>;
        if (contextEmbedding != null)
        {
            float[] temp = new float[1536];
            for (int n = 0; n < 1536; n++)
            {
                temp[n] = (contextEmbedding.ElementAt(n) * (float)0.2) + (embedding[n] * (float)0.8);
            }
            embedding = new ReadOnlyCollection<float>(temp);

            // var contentVector = new Vector<float>(contextEmbedding.ToArray());
            // var curVector = new Vector<float>(embedding.ToArray());
            // contentVector = Vector.Multiply(contentVector, (float)0.2);
            // curVector = Vector.Multiply(curVector, (float)0.8);
            // var newVector = Vector.Add(curVector, contentVector);
            // float[] temp = new float[1536];
            // newVector.CopyTo(temp);
            // embedding = new ReadOnlyCollection<float>(temp);
        }

        Context.Items[ContextVectorItemKey] = embedding;

        var qdrant = SemanticKernelExtension.CreateQdrantMemoryStore();
        IAsyncEnumerable<(MemoryRecord, double)> results = qdrant.GetNearestMatchesAsync(
            CurrentTenant.Id.ToString() ?? "",
            new ReadOnlyMemory<float>(embedding.ToArray()),
            minRelevanceScore: 0.75,
            limit: queryNum
        );

        List<MemoryQueryResult> list = new List<MemoryQueryResult>();
        await foreach (var result in results)
        {
            list.Add(new MemoryQueryResult(
                (MemoryRecordMetadata)result.Item1.Metadata.Clone(),
                result.Item2,
                result.Item1.Embedding.IsEmpty ? null : result.Item1.Embedding)
            );

            if (list.Count >= queryNum)
            {
                break;
            }
        }
        return list;
    }

    // 记录问题命中次数
    protected void RecordQuestionQueryQuantity(List<MemoryQueryResult> results)
    {
        if (results.Count == 0)
        {
            return;
        }

        var first = results[0];
        if (first.Relevance < 0.8)
        {
            return;
        }

        var questionQueryQuantity = this.Context.Items[QuestionQueryQuantityItemKey] as Dictionary<string, int>;
        if (questionQueryQuantity == null)
        {
            questionQueryQuantity = new Dictionary<string, int>();
        }

        questionQueryQuantity.TryGetValue(first.Metadata.Text, out int quantity);
        questionQueryQuantity[first.Metadata.Text] = quantity + 1;

        this.Context.Items[QuestionQueryQuantityItemKey] = questionQueryQuantity;
    }

    protected async Task DisconnectedHandle()
    {
        if (!CurrentUser.Roles.Any(e => e == IceRoleTypes.Guest))
        {
            return;
        }

        if (CurrentTenant.Id == null)
        {
            return;
        }

        var laterecords = this.Context.Items[LateRecordItemKey] as List<ChatItem>;
        if (laterecords == null || laterecords.Count == 0)
        {
            return;
        }

        // 检查访问次数限制，如果超过则不记录
        if (!(await AccessLimiter.Access(WebConfiguration.AIConfig.DayQuestionnaireNum, 86400, "QaHub_DH")))
        {
            return;
        }

        var cancellationTokenProvider = LazyServiceProvider.GetService<ICancellationTokenProvider>();
        Debug.Assert(cancellationTokenProvider != null);
        using (cancellationTokenProvider.Use(CancellationToken.None))
        {
            var unitOfWorkManager = LazyServiceProvider.GetService<IUnitOfWorkManager>();
            using (var uow = unitOfWorkManager.Begin(
                requiresNew: true, isTransactional: true
            ))
            {
                var questionnaireRepository = LazyServiceProvider.GetRequiredService<IRepository<Questionnaire, Guid>>();
                var questionnaireResultRepository = LazyServiceProvider.GetRequiredService<IRepository<QuestionnaireResult, Guid>>();
                var clientRepository = LazyServiceProvider.GetRequiredService<IRepository<Client, Guid>>();

                // 当前访客的登录信息
                LoginInfo? loginInfo = this.Context.Items[LoginInfoItemKey] as LoginInfo;

                // 访客的联系方式
                var contact = this.Context.Items[ContactItemKey] as Contact;
                if (contact != null)
                {
                    await clientRepository.InsertAsync(new Client()
                    {
                        Name = contact.GuestName,
                        Phone = contact.Phone,
                        Email = contact.Email,
                        Intention = ClientIntentionType.UNKNOWN
                    });
                }

                // 记录问题命中次数
                string? focusQuestion = null;
                var questionQueryQuantity = this.Context.Items[QuestionQueryQuantityItemKey] as Dictionary<string, int>;
                if (questionQueryQuantity != null)
                {
                    focusQuestion = string.Join('\n', questionQueryQuantity.Keys);
                }

                // 访客的聊天记录
                StringBuilder chattext = new StringBuilder();
                foreach (var item in laterecords)
                {
                    chattext.Append($"{item.Role}: {item.Content}\n");
                }

                // 问卷问题
                var questionnaires = await questionnaireRepository.GetListAsync(e => e.TenantId == CurrentTenant.Id);
                // 如果没有问题，直接记录聊天记录和联系方式即可
                if (questionnaires.Count == 0)
                {
                    await questionnaireResultRepository.InsertAsync(new QuestionnaireResult()
                    {
                        Questions = "",
                        Results = "",
                        ChatRecords = chattext.ToString(),
                        Ip = loginInfo?.Ip,
                        Province = loginInfo?.Province,
                        FocusQuestion = focusQuestion,
                    });

                    await uow.CompleteAsync();
                    return;
                }

                // 请求gpt分析聊天记录并回答问卷问题
                StringBuilder questions = new StringBuilder();
                for (var n = 0; n < questionnaires.Count; n++)
                {
                    var item = questionnaires[n];
                    questions.Append($"#{n + 1} {item.Question}\r\n");
                }

                // var qaTagRepository = LazyServiceProvider.GetRequiredService<IRepository<QaTag, Guid>>();
                // List<QaTag> tagList = await qaTagRepository.GetListAsync(e => e.TenantId == CurrentTenant.Id);
                // StringBuilder tags = new StringBuilder();
                // for (var n = 0; n < tagList.Count; n++)
                // {
                //     var item = tagList[n];
                //     tags.Append($"{item.Name} ");
                // }
                // if (tags.Length > 0)
                // {
                //     questions.Append($"#{questionnaires.Count + 1} 请为本次对话打上标签，可选的标签选项为: {tags}.");
                // }

                string sysContent = $@"You are a surveyor and you need to help the user complete his survey.";
                string message =
        $@"The content between [CHATRECORD][ENDCHATRECORD] is the conversation between our company and a customer.

[CHATRECORD]
{chattext}
[ENDCHATRECORD]

Please strictly follow the following requirements to output your answer:
#1 Do not restate the question, just answer it directly.
#2 Answers need to be marked with serial numbers, such as #1, #2, #3.
#3 Answer in the shortest sentence.
#4 Answer in the order of the questions, with \n as the separator between answers.
#5 If you don't know the answer, answer ""unknown"", do not use other statements.
#6 Please answer in Chinese.

Please answer the question between [QUESTION][ENDQUESTION] for this conversation.
[QUESTION]
{questions}
[ENDQUESTION]
";
                // var kernel = SemanticKernelExtension.BuildKernel(true);
                // kernel.ImportFunctions(new QaResultFunction(), nameof(QaResultFunction));

                // // 新建计划
                // var planner = new SequentialPlanner(kernel);
                // var plan = await planner.CreatePlanAsync(message);

                // // 执行计划
                // var planResult = await kernel.RunAsync(plan);

                OpenAIClient client = new OpenAIClient(
                    new Uri(WebConfiguration.AzureOpenAI.Endpoint),
                    new AzureKeyCredential(WebConfiguration.AzureOpenAI.ApiKey)
                );

                List<ChatMessage> chatMessages = new List<ChatMessage>();
                chatMessages.Add(new ChatMessage(ChatRole.System, sysContent));
                chatMessages.Add(new ChatMessage(ChatRole.User, message));

                Response<ChatCompletions> responseWithoutStream = await client.GetChatCompletionsAsync(
                    WebConfiguration.AzureOpenAI.ChatK16DeploymentName,
                    new ChatCompletionsOptions(chatMessages)
                    {
                        Temperature = (float)0.1,
                        MaxTokens = 800,
                        NucleusSamplingFactor = (float)0.1,
                        FrequencyPenalty = 1,
                        PresencePenalty = 1,
                    });
                ChatCompletions completions = responseWithoutStream.Value;
                string? rely = completions.Choices[0]?.Message.Content;

                // 整理答案
                string? questionnaireResultStr = null;
                if (!string.IsNullOrWhiteSpace(rely))
                {
                    Regex regex = new Regex("^#[0-9]+ ");
                    var arr = rely.Replace("\\n", "\n").Split("\n").Select((e, i) =>
                    {
                        string result = regex.Replace(e, "");
                        // 有时候AI的答案会携带问题，这里把问题去掉
                        if(i <= (questionnaires.Count - 1)) {
                            result = result.Replace(questionnaires[i].Question, "");
                        }
                        return result.Trim();
                    }).ToArray();
                    questionnaireResultStr = string.Join('\n', arr);
                }

                await questionnaireResultRepository.InsertAsync(new QuestionnaireResult()
                {
                    Questions = string.Join("\n", questionnaires.Select(e => e.Question)),
                    Results = questionnaireResultStr,
                    ChatRecords = chattext.ToString(),
                    Ip = loginInfo?.Ip,
                    Province = loginInfo?.Province,
                    FocusQuestion = focusQuestion,
                });

                // 检查AI使用次数是否超过免费次数，超过后额外收费
                var aiUseQuantity = ((this.Context.Items[AIUseQuantityItemKey] as int?) ?? 0);
                if (aiUseQuantity > 0)
                {
                    var TenantManager = LazyServiceProvider.GetRequiredService<TenantManager>();
                    await TenantManager.SystemDeduct(CurrentTenant.Id.Value, aiUseQuantity * WebConfiguration.AIConfig.DayExtraAccessFee, $"AI客服额外扣费");
                }

                await uow.CompleteAsync();
            }
        }
    }
    # endregion

    public override async Task OnConnectedAsync()
    {
        if (CurrentTenant.Id == null)
        {
            throw new Exception("Tenant not found");
        }

        if (this.CurrentUser.Id == null)
        {
            throw new Exception("user not found");
        }

        if (CurrentUser.Roles.Any(e => e == IceRoleTypes.Admin))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, this.GetAdminGroupName());
        }
        else
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, this.GetGuestGroupName());
        }

        // 查询当前租户是否有余额
        bool haveAmount = false;
        var unitOfWorkManager = LazyServiceProvider.GetService<IUnitOfWorkManager>();
        using (var uow = unitOfWorkManager.Begin(
            requiresNew: true, isTransactional: false
        ))
        {
            IRepository<Tenant>? tenantRepository = LazyServiceProvider.GetService<IRepository<Tenant>>();
            if (tenantRepository != null)
            {
                var tenant = await tenantRepository.FirstOrDefaultAsync(e => e.Id == CurrentTenant.Id);
                if (tenant != null)
                {
                    haveAmount = true;
                }
            }

            var gptRepository = LazyServiceProvider.GetRequiredService<IRepository<Gpt>>();
            var gpt = await gptRepository.FirstOrDefaultAsync();
            this.Context.Items[GuestAiResponeCountItemKey] = gpt.AiResponeCount;
        }
        this.Context.Items[HaveAmountItemKey] = haveAmount;

        // 获取IP地址
        var guestInfoHelper = LazyServiceProvider.GetService<GuestInfoHelper>();
        if (guestInfoHelper == null)
        {
            throw new NotImplementedException();
        }

        var loginInfo = await guestInfoHelper.GetLoginInfo(CurrentUser.Id.ToString() ?? "");
        this.Context.Items[LoginInfoItemKey] = loginInfo;

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await DisconnectedHandle();
        await base.OnDisconnectedAsync(exception);
    }
}

public class QaCacheInfo
{
    public bool EnableAI { get; set; }
}

public class ReplyInfo
{
    public string? Text { get; set; }

    public string? Original { get; set; }

    public string? AdditionalMetadata { get; set; }
}

public class Contact
{
    public string? GuestName { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }
}

public class IpResponse
{
    // success 为请求成功 
    public string? status { get; set; }

    public string? region { get; set; }

    public string? regionName { get; set; }

    public string? city { get; set; }

    public string? timezone { get; set; }

    public double? lat { get; set; }

    public double? lon { get; set; }
};

public class GuestUsedCount
{
    public int Count { get; set; }
}
