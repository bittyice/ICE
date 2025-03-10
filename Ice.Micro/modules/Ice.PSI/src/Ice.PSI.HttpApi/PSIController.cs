using Ice.PSI.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace Ice.PSI;

public abstract class PSIController : AbpControllerBase
{
    protected PSIController()
    {
        LocalizationResource = typeof(PSIResource);
    }
}
