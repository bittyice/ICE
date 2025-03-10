using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace Ice.PSI;

[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(PSIDomainSharedModule)
)]
public class PSIDomainModule : AbpModule
{

}
