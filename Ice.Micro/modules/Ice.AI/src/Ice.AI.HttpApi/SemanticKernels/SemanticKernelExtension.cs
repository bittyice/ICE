using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.Memory.Qdrant;

namespace Ice.AI.SemanticKernel;

public static class SemanticKernelExtension
{
    public static QdrantMemoryStore CreateQdrantMemoryStore() {
        return new QdrantMemoryStore(WebConfiguration.AIConfig.AIDB, 1536);
    }

    public static IKernel BuildKernel(bool isGpt16k)
    {
        var builder = new KernelBuilder();

        builder.WithAzureChatCompletionService(
            isGpt16k ? WebConfiguration.AzureOpenAI.ChatK16DeploymentName : WebConfiguration.AzureOpenAI.ChatDeploymentName,
            WebConfiguration.AzureOpenAI.Endpoint,
            WebConfiguration.AzureOpenAI.ApiKey);

        // builder.WithAzureTextCompletionService(
        //     WebConfiguration.AzureOpenAI.TextDeploymentName,
        //     WebConfiguration.AzureOpenAI.Endpoint,
        //     WebConfiguration.AzureOpenAI.ApiKey);

        // 配置 TextEmbedding 模型
        builder.WithAzureTextEmbeddingGenerationService(
            WebConfiguration.AzureOpenAI.EmbeddingDeploymentName,
            WebConfiguration.AzureOpenAI.Endpoint,
            WebConfiguration.AzureOpenAI.ApiKey);

        var memoryStore = CreateQdrantMemoryStore();

        // Host=127.0.0.1;Port=5432;Database=ai;Username=postgres;Password=fuckStrongP@ssw0rd;
        // https://github.com/microsoft/semantic-kernel/blob/main/dotnet/src/Connectors/Connectors.Memory.Postgres/README.md
        builder.WithMemoryStorage(memoryStore);

        var kernel = builder.Build();

        return kernel;
    }

    public static IServiceCollection AddSemanticKernel(this IServiceCollection services)
    {
        // Semantic Kernel 配置
        services.AddScoped<IKernel>((IServiceProvider provider) =>
        {
            return BuildKernel(false);
        });

        return services;
    }
}