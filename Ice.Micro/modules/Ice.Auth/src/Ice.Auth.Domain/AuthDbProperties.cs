namespace Ice.Auth;

public static class AuthDbProperties
{
    public static string DbTablePrefix { get; set; } = "Auth";

    public static string? DbSchema { get; set; } = null;

    public const string ConnectionStringName = "Auth";
}
