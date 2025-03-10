using Ice.PSI.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace Ice.PSI.Permissions;

public class PSIPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(PSIPermissions.GroupName, L("Permission:PSI"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<PSIResource>(name);
    }
}
