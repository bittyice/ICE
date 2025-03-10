using Ice.AI.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace Ice.AI;

public abstract class AIController : AbpControllerBase
{
    protected AIController()
    {
        LocalizationResource = typeof(AIResource);
    }
}
