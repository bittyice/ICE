public class PostInput
{
    public string? ChatWelcomeText { get; set; }

    public string? QaWelcomeText { get; set; }

    public int? ContactBoxSpanTime { get; set; }

    // 客户无响应时自动发送的消息
    public string? ClientNoResponseText { get; set; }

    // 客户无响应时多少秒后自动发送消息
    public int? ClientNoResponseTime { get; set; }

    // 客户引导问题，在连接时发送
    public string? ClientGuideQuestionText { get; set; }

    // 每个访客AI回复次数
    public int? AiResponeCount { get; set; }
}