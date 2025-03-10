using Ice.Base.Localization;
using Volo.Abp.Application.Services;

namespace Ice.Base;

public abstract class BaseAppService : ApplicationService
{
    protected BaseAppService()
    {
        LocalizationResource = typeof(BaseResource);
        ObjectMapperContext = typeof(BaseApplicationModule);
    }
}
