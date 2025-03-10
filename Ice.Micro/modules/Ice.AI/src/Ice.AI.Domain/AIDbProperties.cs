namespace Ice.AI;

public static class AIDbProperties
{
    public static string DbTablePrefix { get; set; } = "AI";

    public static string? DbSchema { get; set; } = null;

    public const string ConnectionStringName = "AI";
}
