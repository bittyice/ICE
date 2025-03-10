using Volo.Abp.Reflection;

namespace Ice.PSI.Permissions;

public class PSIPermissions
{
    public const string GroupName = "PSI";

    public static string[] GetAll()
    {
        return ReflectionHelper.GetPublicConstantsRecursively(typeof(PSIPermissions));
    }
}
