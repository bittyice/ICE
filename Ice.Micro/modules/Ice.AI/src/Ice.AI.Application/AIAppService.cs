using Ice.AI.Localization;
using Volo.Abp.Application.Services;

namespace Ice.AI;

public abstract class AIAppService : ApplicationService
{
    protected AIAppService()
    {
        LocalizationResource = typeof(AIResource);
        ObjectMapperContext = typeof(AIApplicationModule);
    }
}
