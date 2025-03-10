using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace Ice.PSI.EntityFrameworkCore;

[ConnectionStringName(PSIDbProperties.ConnectionStringName)]
public interface IPSIDbContext : IEfCoreDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * DbSet<Question> Questions { get; }
     */
}
