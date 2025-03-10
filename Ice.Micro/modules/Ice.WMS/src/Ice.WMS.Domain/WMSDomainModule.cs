using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace Ice.WMS;

[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(WMSDomainSharedModule)
)]
public class WMSDomainModule : AbpModule
{

}
