namespace Ice.PSI;

public static class PSIDbProperties
{
    public static string DbTablePrefix { get; set; } = "PSI";

    public static string? DbSchema { get; set; } = null;

    public const string ConnectionStringName = "PSI";
}
