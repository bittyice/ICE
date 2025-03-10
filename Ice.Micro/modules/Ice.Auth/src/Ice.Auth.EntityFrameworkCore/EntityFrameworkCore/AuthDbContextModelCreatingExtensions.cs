using Ice.Auth.Core;
using Ice.Utils;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Ice.Auth.EntityFrameworkCore;

public static class AuthDbContextModelCreatingExtensions
{
    public static void ConfigureAuth(
        this ModelBuilder builder)
    {
        Check.NotNull(builder, nameof(builder));

        /* Configure all entities here. Example:

        builder.Entity<Question>(b =>
        {
            //Configure table & schema name
            b.ToTable(AuthDbProperties.DbTablePrefix + "Questions", AuthDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.Title).IsRequired().HasMaxLength(QuestionConsts.MaxTitleLength);

            //Relations
            b.HasMany(question => question.Tags).WithOne().HasForeignKey(qt => qt.QuestionId);

            //Indexes
            b.HasIndex(q => q.CreationTime);
        });
        */

        builder.Entity<User>(b =>
        {
            //Configure table & schema name
            b.ToTable(AuthDbProperties.DbTablePrefix + "User", AuthDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(u => u.UserName).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.Email).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.EmailConfirmed).HasDefaultValue(false);
            b.Property(u => u.PhoneNumber).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.PhoneNumberConfirmed).HasDefaultValue(false);

            b.Property(u => u.NormalizedUserName).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.NormalizedEmail).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.PasswordHash).HasMaxLength(256);
            b.Property(u => u.SecurityStamp).HasMaxLength(256);
            b.Property(u => u.LockoutEnabled).HasDefaultValue(false);

            b.HasIndex(u => u.NormalizedUserName);
            b.HasIndex(u => u.NormalizedEmail);
            b.HasIndex(u => u.UserName);
            b.HasIndex(u => u.Email);
        });

        builder.Entity<PayOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(AuthDbProperties.DbTablePrefix + "PayOrder", AuthDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.OrderNumber).IsRequired();
            b.Property(q => q.Type).IsRequired();
            b.Property(q => q.Description).IsRequired();
            b.Property(q => q.Status).IsRequired();
            b.Property(q => q.TenantId).IsRequired();

            //Indexes
            b.HasIndex(q => q.OrderNumber);
            b.HasIndex(q => q.CreatedTime);
            b.HasIndex(q => q.TenantId);
        });

        builder.Entity<Tenant>(b =>
        {
            b.ToTable(AuthDbProperties.DbTablePrefix + "Tenant", AuthDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.ApplyObjectExtensionMappings();

            b.Property(q => q.Saler).HasMaxLength(Consts.MinTextLength);

            b.HasIndex(e => e.CreationTime);
        });

        builder.Entity<AmountAdjust>(b =>
        {
            b.ToTable(AuthDbProperties.DbTablePrefix + "AmountAdjust", AuthDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.HasIndex(e => e.Type);
            b.HasIndex(e => e.CreationTime);
            b.HasIndex(e => e.TenantId);
        });

        builder.Entity<OpenService>(b =>
        {
            b.ToTable(AuthDbProperties.DbTablePrefix + "OpenService", AuthDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(q => q.Name).IsRequired().HasMaxLength(Consts.Length128);

            b.HasIndex(e => e.TenantId);
            b.HasIndex(e => new { e.TenantId, e.Name }).IsUnique(true);
        });

        builder.Entity<IdentitySecurityLog>(b =>
        {
            b.ToTable(AuthDbProperties.DbTablePrefix + "IdentitySecurityLog", AuthDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.HasIndex(e => e.UserId);
        });

        builder.Entity<Company>(b =>
        {
            b.ToTable(AuthDbProperties.DbTablePrefix + "Company", AuthDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(q => q.Name).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.Contact).HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.Phone).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Province).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.City).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Town).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Street).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.AddressDetail).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.Postcode).HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.TenantId).IsRequired();

            b.HasIndex(e => e.TenantId).IsUnique();
        });

        builder.Entity<GuestBlacklist>(b =>
        {
           b.ToTable(AuthDbProperties.DbTablePrefix + "GuestBlacklist", AuthDbProperties.DbSchema);
           b.ConfigureByConvention();

           b.Property(q => q.Ip).IsRequired().HasMaxLength(Consts.MinTextLength);

           b.HasIndex(e => e.TenantId);
           b.HasIndex(e => e.CreationTime);
           b.HasIndex(e => e.Ip);
       });
    }
}
