using Ice.WMS.Localization;
using Volo.Abp.Application.Services;

namespace Ice.WMS;

public abstract class WMSAppService : ApplicationService
{
    protected WMSAppService()
    {
        LocalizationResource = typeof(WMSResource);
        ObjectMapperContext = typeof(WMSApplicationModule);
    }
}
