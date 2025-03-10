using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace Ice.WMS.EntityFrameworkCore;

[ConnectionStringName(WMSDbProperties.ConnectionStringName)]
public interface IWMSDbContext : IEfCoreDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * DbSet<Question> Questions { get; }
     */
}
