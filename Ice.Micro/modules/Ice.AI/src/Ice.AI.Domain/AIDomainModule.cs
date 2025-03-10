using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace Ice.AI;

[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(AIDomainSharedModule)
)]
public class AIDomainModule : AbpModule
{

}
