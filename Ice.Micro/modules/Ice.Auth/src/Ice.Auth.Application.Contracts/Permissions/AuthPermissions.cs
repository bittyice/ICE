using Volo.Abp.Reflection;

namespace Ice.Auth.Permissions;

public class AuthPermissions
{
    public const string GroupName = "Auth";

    public static string[] GetAll()
    {
        return ReflectionHelper.GetPublicConstantsRecursively(typeof(AuthPermissions));
    }
}
