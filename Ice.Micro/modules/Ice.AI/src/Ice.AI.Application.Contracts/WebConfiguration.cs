
using System;
using Microsoft.Extensions.Configuration;

namespace Ice.AI;

public static class WebConfiguration
{
    public static AzureOpenAI AzureOpenAI = new AzureOpenAI();

    public static AIConfig AIConfig = new AIConfig();

    public static void Init(IConfiguration configuration)
    {
        AzureOpenAI.Endpoint = configuration["AzureOpenAI:Endpoint"];
        AzureOpenAI.ChatDeploymentName = configuration["AzureOpenAI:ChatDeploymentName"];
        AzureOpenAI.ChatK16DeploymentName = configuration["AzureOpenAI:ChatK16DeploymentName"];
        AzureOpenAI.TextDeploymentName = configuration["AzureOpenAI:TextDeploymentName"];
        AzureOpenAI.TextCurieDeploymentName = configuration["AzureOpenAI:TextCurieDeploymentName"];
        AzureOpenAI.EmbeddingDeploymentName = configuration["AzureOpenAI:EmbeddingDeploymentName"];
        AzureOpenAI.ApiKey = configuration["AzureOpenAI:ApiKey"];

        AIConfig.DayAccessNum = Convert.ToInt32(configuration["AIConfig:DayAccessNum"]);
        AIConfig.DayExtraAccessFee = Convert.ToInt32(configuration["AIConfig:DayExtraAccessFee"]);
        AIConfig.DayQuestionnaireNum = Convert.ToInt32(configuration["AIConfig:DayQuestionnaireNum"]);
        AIConfig.DayAccessLimtNum = Convert.ToInt32(configuration["AIConfig:DayAccessLimtNum"]);
        AIConfig.AIDB = configuration["AIConfig:AIDB"];
    }
}

public class AIConfig
{
    public int DayAccessNum { get; set; }

    public int DayExtraAccessFee { get; set; }

    public int DayQuestionnaireNum { get; set; }

    public int DayAccessLimtNum { get; set; }

    public string AIDB { get; set; }
}

public class AzureOpenAI
{
    public string Endpoint { get; set; }

    public string ChatDeploymentName { get; set; }

    public string ChatK16DeploymentName { get; set; }

    public string TextDeploymentName { get; set; }

    public string TextCurieDeploymentName { get; set; }

    public string EmbeddingDeploymentName { get; set; }

    public string ApiKey { get; set; }
}