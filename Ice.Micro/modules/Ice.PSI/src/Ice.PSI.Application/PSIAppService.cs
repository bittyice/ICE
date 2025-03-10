using Ice.PSI.Localization;
using Volo.Abp.Application.Services;

namespace Ice.PSI;

public abstract class PSIAppService : ApplicationService
{
    protected PSIAppService()
    {
        LocalizationResource = typeof(PSIResource);
        ObjectMapperContext = typeof(PSIApplicationModule);
    }
}
