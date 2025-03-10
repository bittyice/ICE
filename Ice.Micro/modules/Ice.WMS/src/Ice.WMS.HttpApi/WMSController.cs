using Ice.WMS.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace Ice.WMS;

public abstract class WMSController : AbpControllerBase
{
    protected WMSController()
    {
        LocalizationResource = typeof(WMSResource);
    }
}
