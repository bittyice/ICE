using Ice.Base.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace Ice.Base;

public abstract class BaseController : AbpControllerBase
{
    protected BaseController()
    {
        LocalizationResource = typeof(BaseResource);
    }
}
