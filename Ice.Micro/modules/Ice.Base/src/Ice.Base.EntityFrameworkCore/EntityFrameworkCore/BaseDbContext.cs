using Ice.Base.Core.Addresss;
using Ice.Base.Core.Classifys;
using Ice.Base.Core.ProductInfos;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace Ice.Base.EntityFrameworkCore;

[ConnectionStringName(BaseDbProperties.ConnectionStringName)]
public class BaseDbContext : AbpDbContext<BaseDbContext>, IBaseDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * public DbSet<Question> Questions { get; set; }
     */

    public DbSet<ProductInfo> ProductInfos { get; set; }
    public DbSet<AddressBook> AddressBooks { get; set; }
    public DbSet<Classify> Classifys { get; set; }

    public BaseDbContext(DbContextOptions<BaseDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ConfigureBase();
    }
}
