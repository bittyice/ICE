using Ice.Auth.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace Ice.Auth.Permissions;

public class AuthPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(AuthPermissions.GroupName, L("Permission:Auth"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<AuthResource>(name);
    }
}
