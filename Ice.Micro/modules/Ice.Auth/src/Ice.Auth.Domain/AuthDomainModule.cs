using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace Ice.Auth;

[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(AuthDomainSharedModule)
)]
public class AuthDomainModule : AbpModule
{

}
