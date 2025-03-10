using Ice.Auth.Localization;
using Volo.Abp.Application.Services;

namespace Ice.Auth;

public abstract class AuthAppService : ApplicationService
{
    protected AuthAppService()
    {
        LocalizationResource = typeof(AuthResource);
        ObjectMapperContext = typeof(AuthApplicationModule);
    }
}
