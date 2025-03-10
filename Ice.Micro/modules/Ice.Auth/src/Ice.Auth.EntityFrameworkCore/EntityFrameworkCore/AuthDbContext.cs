using Ice.Auth.Core;
using Ice.Utils;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace Ice.Auth.EntityFrameworkCore;

[ConnectionStringName(AuthDbProperties.ConnectionStringName)]
public class AuthDbContext : AbpDbContext<AuthDbContext>, IAuthDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * public DbSet<Question> Questions { get; set; }
     */

    public AuthDbContext(DbContextOptions<AuthDbContext> options)
        : base(options)
    {

    }

    public DbSet<User> Users { get; set; }
    public DbSet<AmountAdjust> AmountAdjusts { get; set; }
    public DbSet<PayOrder> PayOrders { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<OpenService> OpenServices { get; set; }
    public DbSet<IdentitySecurityLog> IdentitySecurityLogs { get; set; }
    public DbSet<Company> Companys { get; set; }
    public DbSet<GuestBlacklist> GuestBlacklists { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ConfigureAuth();
        builder.Entity<User>().HasData(new User(new System.Guid("60d9b70b-8e9a-a895-27f3-3a05c3722fbd"), IceRoleTypes.Host)
        {
            UserName = "adminpromax",
            ConcurrencyStamp = "d05e0740e51140c28902c343ef897487",
            AccessFailedCount = 0,
            NormalizedUserName = "ADMINPROMAX",
            SecurityStamp = "PDQ6EMIWFM4TB6ALQDZVFTX6FD4GYKZ6",
            EmailConfirmed = false,
            PhoneNumberConfirmed = false,
            LockoutEnabled = false,
            PhoneNumber = null,
            NormalizedEmail = null,
            PasswordHash = "AQAAAAEAACcQAAAAEOITnnqwuSS4Gm8XUodXDZPrpP/AcLRiri7IzyzIteOf5w18905r/Yoaz5S9feLwAg=="
        });
    }
}
