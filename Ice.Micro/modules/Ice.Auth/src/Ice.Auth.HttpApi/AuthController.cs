using Ice.Auth.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace Ice.Auth;

public abstract class AuthController : AbpControllerBase
{
    protected AuthController()
    {
        LocalizationResource = typeof(AuthResource);
    }
}
