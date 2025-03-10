using Ice.PSI.MongoDB;
using Volo.Abp.Modularity;

namespace Ice.PSI;

/* Domain tests are configured to use the EF Core provider.
 * You can switch to MongoDB, however your domain tests should be
 * database independent anyway.
 */
[DependsOn(
    typeof(PSIMongoDbTestModule)
    )]
public class PSIDomainTestModule : AbpModule
{

}
