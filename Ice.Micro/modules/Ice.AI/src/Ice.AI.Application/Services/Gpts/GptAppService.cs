

using System;
using System.Linq;
using System.Threading.Tasks;
using Ice.AI.Core;
using Ice.AI.Dtos;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Domain.Repositories;

namespace Ice.AI.Services;

public class GptAppService : AIAppService
{
    protected IRepository<Gpt, Guid> Repository { get; set; }

    public GptAppService(IRepository<Gpt, Guid> repository)
    {
        Repository = repository;
    }

    [Authorize]
    public async Task<GptDto> Get()
    {
        var gpt = await Repository.FirstOrDefaultAsync();
        if (gpt == null)
        {
            return new GptDto()
            {
                ChatWelcomeText = "欢迎使用IceAI助手。",
                QaWelcomeText = "欢迎使用IceAI助手。",
                ContactBoxSpanTime = -1,
            };
        }

        return ObjectMapper.Map<Gpt, GptDto>(gpt);
    }

    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.AIScope)]
    public async Task Post(PostInput input)
    {
        var gpt = await Repository.FirstOrDefaultAsync();
        if (gpt == null)
        {
            gpt = new Gpt();
            await Repository.InsertAsync(gpt);
        }

        gpt.ChatWelcomeText = input.ChatWelcomeText;
        gpt.QaWelcomeText = input.QaWelcomeText;
        gpt.ContactBoxSpanTime = input.ContactBoxSpanTime ?? -1;
        gpt.ClientNoResponseText = input.ClientNoResponseText;
        gpt.ClientNoResponseTime = input.ClientNoResponseTime;
        gpt.ClientGuideQuestionText = input.ClientGuideQuestionText;
        gpt.AiResponeCount = input.AiResponeCount;
    }
}