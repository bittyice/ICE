using Ice.AI.MongoDB;
using Volo.Abp.Modularity;

namespace Ice.AI;

/* Domain tests are configured to use the EF Core provider.
 * You can switch to MongoDB, however your domain tests should be
 * database independent anyway.
 */
[DependsOn(
    typeof(AIMongoDbTestModule)
    )]
public class AIDomainTestModule : AbpModule
{

}
