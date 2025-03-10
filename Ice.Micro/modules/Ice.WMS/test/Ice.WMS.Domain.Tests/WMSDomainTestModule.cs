using Ice.WMS.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace Ice.WMS;

/* Domain tests are configured to use the EF Core provider.
 * You can switch to MongoDB, however your domain tests should be
 * database independent anyway.
 */
[DependsOn(
    typeof(WMSEntityFrameworkCoreTestModule)
    )]
public class WMSDomainTestModule : AbpModule
{

}
