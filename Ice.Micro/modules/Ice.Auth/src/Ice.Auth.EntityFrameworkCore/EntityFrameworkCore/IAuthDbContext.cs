using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace Ice.Auth.EntityFrameworkCore;

[ConnectionStringName(AuthDbProperties.ConnectionStringName)]
public interface IAuthDbContext : IEfCoreDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * DbSet<Question> Questions { get; }
     */
}
