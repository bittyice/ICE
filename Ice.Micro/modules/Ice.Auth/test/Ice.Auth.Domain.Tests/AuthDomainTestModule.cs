using Ice.Auth.MongoDB;
using Volo.Abp.Modularity;

namespace Ice.Auth;

/* Domain tests are configured to use the EF Core provider.
 * You can switch to MongoDB, however your domain tests should be
 * database independent anyway.
 */
[DependsOn(
    typeof(AuthMongoDbTestModule)
    )]
public class AuthDomainTestModule : AbpModule
{

}
