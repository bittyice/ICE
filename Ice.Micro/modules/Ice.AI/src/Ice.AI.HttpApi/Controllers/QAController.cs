
using System.Text;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using Microsoft.SemanticKernel.Memory;
using System.Net.Http;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using Microsoft.SemanticKernel.Connectors.Memory.Qdrant;
using System.Net;
using Ice.AI.SemanticKernel;
using Ice.Utils;
using System.ComponentModel.DataAnnotations;
using Azure.AI.OpenAI;
using Azure;
using Microsoft.SemanticKernel.AI.Embeddings;

namespace Ice.AI;

[ApiController]
[Route("/api/ai/qa/[action]")]
[Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.AIScope)]
public class QAController : AIController
{
    protected IKernel Kernel { get; set; }

    protected QdrantMemoryStore QdrantMemoryStore { get; set; }

    public QAController(
        IKernel kernel
    )
    {
        Kernel = kernel;
        QdrantMemoryStore = SemanticKernelExtension.CreateQdrantMemoryStore();
    }

    [HttpPost]
    [ActionName("add")]
    public async Task Add(AddQAInput input)
    {
        if (CurrentTenant.Id == null)
        {
            throw new Exception("Tenant not found");
        }
        Guid id = GuidGenerator.Create();
        await Kernel.Memory.SaveInformationAsync(
            CurrentTenant.Id.ToString(),
            id: id.ToString(),
            text: input.Question,
            description: input.Answer,
            additionalMetadata: input.AdditionalMetadata
        );
    }

    [HttpPost]
    [ActionName("update")]
    public async Task Update(Guid id, UpdateInput input)
    {
        if (CurrentTenant.Id == null)
        {
            throw new Exception("Tenant not found");
        }

        // OpenAIClient client = new OpenAIClient(
        //     new Uri(WebConfiguration.AzureOpenAI.Endpoint),
        //     new AzureKeyCredential(WebConfiguration.AzureOpenAI.ApiKey)
        // );

        // var response = await client.GetEmbeddingsAsync(
        //     WebConfiguration.AzureOpenAI.EmbeddingDeploymentName,
        //     new EmbeddingsOptions(input.Question));

        // if (response == null)
        // {
        //     throw new Exception("Text embedding null response");
        // }

        // if (response.Value.Data.Count == 0)
        // {
        //     throw new Exception("Text embedding not found");
        // }

        // var embedding = response.Value.Data[0].Embedding;

        // MemoryRecord data = MemoryRecord.LocalRecord(
        //     id: id.ToString(), text: input.Question, description: input.Answer, additionalMetadata: input.AdditionalMetadata, embedding: new Embedding<float>(embedding, transferOwnership: true));

        // await QdrantMemoryStore.UpsertAsync(CurrentTenant.Id.ToString(), data);

        await Kernel.Memory.SaveInformationAsync(
            CurrentTenant.Id.ToString(),
            id: GuidGenerator.Create().ToString(),
            text: input.Question,
            description: input.Answer,
            additionalMetadata: input.AdditionalMetadata
        );

        // 目前还存在一个bug，更新实际上是添加，所以这里需要删除旧的数据
        await Delete(id);
    }

    [HttpDelete]
    [ActionName("delete")]
    public async Task Delete(Guid id)
    {
        if (CurrentTenant.Id == null)
        {
            throw new Exception("Tenant not found");
        }
        try
        {
            await QdrantMemoryStore.RemoveWithPointIdAsync(CurrentTenant.Id.ToString(), id.ToString());
            // await Kernel.Memory.RemoveAsync(CurrentTenant.Id.ToString(), id.ToString());
        }
        // 这个nuget包存在一个bug，需要这样才能不报错
        catch (NotSupportedException ex)
        {
        }
    }

    [HttpDelete]
    [ActionName("delete-all")]
    public async Task DeleteAll()
    {
        if (CurrentTenant.Id == null)
        {
            throw new Exception("Tenant not found");
        }
        await QdrantMemoryStore.DeleteCollectionAsync(CurrentTenant.Id.ToString());
    }

    [HttpPost]
    [ActionName("qa")]
    public async Task<QAOutput> QA(QAInput input)
    {
        if (CurrentTenant.Id == null)
        {
            throw new Exception("Tenant not found");
        }
        var results = Kernel.Memory.SearchAsync(CurrentTenant.Id.ToString(), input.Question);
        MemoryQueryResult? firstresult = null;
        await foreach (var result in results)
        {
            firstresult = result;
            break;
        }
        return new QAOutput()
        {
            Question = firstresult?.Metadata.Text,
            Answer = firstresult?.Metadata.Description,
            AdditionalMetadata = firstresult?.Metadata.AdditionalMetadata
        };
    }

    [HttpGet]
    [ActionName("qa-list")]
    public async Task<GetQAListOutput> GetQAList([FromQuery] GetQAListInput input)
    {
        // 文档地址 https://qdrant.github.io/qdrant/redoc/index.html#section/Examples
        HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, $"{WebConfiguration.AIConfig.AIDB}/collections/{CurrentTenant.Id.ToString()}/points/scroll");
        request.Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(new
        {
            filter = !string.IsNullOrWhiteSpace(input.Question) ? new
            {
                must = new object[] {
                    new { key = "text", match = new { text = input.Question } }
                }
            } : null,
            offset = input.OffsetId,
            limit = input.Limit,
            with_payload = true,
            with_vector = false
        }));
        request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        HttpClient client = new HttpClient();
        var respone = await client.SendAsync(request);
        if (!respone.IsSuccessStatusCode)
        {
            // 集合不存在
            if (respone.StatusCode == HttpStatusCode.NotFound)
            {
                return new GetQAListOutput()
                {
                    Items = new List<QADto>(),
                    NextPageOffsetId = null,
                };
            }
            throw new Exception($"矢量数据库查询错误，错误码 {respone.StatusCode}");
        }
        var result = await respone.Content.ReadFromJsonAsync<QueryQaListResult>();
        var dtos = result.result.points.Select(e => new QADto()
        {
            Id = e.id,
            Question = e.payload?.text,
            Answer = e.payload?.description,
            AdditionalMetadata = e.payload?.additional_metadata
        }).ToList();

        return new GetQAListOutput()
        {
            Items = dtos,
            NextPageOffsetId = result.result.next_page_offset
        };
    }
}

public class AddQAInput
{
    [MaxLength(Consts.MediumTextLength)]
    public string Question { get; set; }

    [MaxLength(500)]
    public string Answer { get; set; }

    [MaxLength(Consts.LargerTextLength)]
    public string? AdditionalMetadata { get; set; }
}

public class UpdateInput
{
    [MaxLength(Consts.MediumTextLength)]
    public string Question { get; set; }

    [MaxLength(500)]
    public string Answer { get; set; }

    [MaxLength(Consts.LargerTextLength)]
    public string? AdditionalMetadata { get; set; }
}

public class QAInput
{
    [MaxLength(Consts.MediumTextLength)]
    public string Question { get; set; }
}

public class QAOutput
{
    public string Question { get; set; }

    public string Answer { get; set; }

    public string? AdditionalMetadata { get; set; }
}

public class GetQAListInput
{
    public string? OffsetId { get; set; }

    public string? Question { get; set; }

    [Range(0, 9999)]
    public int Limit { get; set; }
}

public class GetQAListOutput
{
    public List<QADto> Items { get; set; }

    public string? NextPageOffsetId { get; set; }
}

public class QADto
{
    public string Id { get; set; }
    public string Question { get; set; }
    public string Answer { get; set; }
    public string? AdditionalMetadata { get; set; }
}

public class QueryQaListResult
{
    public QueryQaListResultResult result { get; set; }

    public string status { get; set; }

    public double time { get; set; }
}

public class QueryQaListResultResult
{
    public List<QueryQaListResultResultPoint> points { get; set; }

    public string next_page_offset { get; set; }
}

public class QueryQaListResultResultPoint
{
    public string id { get; set; }
    public QueryQaListResultResultPointPayload payload { get; set; }
}

public class QueryQaListResultResultPointPayload
{
    public string? additional_metadata { get; set; }
    public string? description { get; set; }
    public string? external_source_name { get; set; }
    public string? id { get; set; }
    public string? text { get; set; }
}
