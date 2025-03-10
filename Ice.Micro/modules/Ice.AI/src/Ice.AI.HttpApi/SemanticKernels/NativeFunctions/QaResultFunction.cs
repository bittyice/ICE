
using System;
using System.ComponentModel;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Orchestration;

namespace Ice.AI.SemanticKernel.NativeFunctions;

public class QaResultFunction
{
    public QaResultFunction()
    {
    }

    // 描述函数的功能，Kernel 根据目标判断是否需要调用该函数
    [SKFunction, Description("Save Questionnaire Results")]
    public void SaveQuestionnaireResult(
        [Description("Questionnaire Results")]
        string text,
        SKContext context
    )
    {
        Console.WriteLine(text);
    }

    [SKFunction, Description("Save Questionnaire Tags")]
    public void SaveQuestionnaireTag(
        [Description("Questionnaire Tags")]
        string tag,
        SKContext context
    )
    {
        Console.WriteLine(tag);
    }
}