using Ice.Base.Core.Addresss;
using Ice.Base.Core.Classifys;
using Ice.Base.Core.ProductInfos;
using Ice.Utils;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Ice.Base.EntityFrameworkCore;

public static class BaseDbContextModelCreatingExtensions
{
    public static void ConfigureBase(
        this ModelBuilder builder)
    {
        Check.NotNull(builder, nameof(builder));

        /* Configure all entities here. Example:

        builder.Entity<Question>(b =>
        {
            //Configure table & schema name
            b.ToTable(BaseDbProperties.DbTablePrefix + "Questions", BaseDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.Title).IsRequired().HasMaxLength(QuestionConsts.MaxTitleLength);

            //Relations
            b.HasMany(question => question.Tags).WithOne().HasForeignKey(qt => qt.QuestionId);

            //Indexes
            b.HasIndex(q => q.CreationTime);
        });
        */

        builder.Entity<ProductInfo>(b =>
        {
            //Configure table & schema name
            b.ToTable(BaseDbProperties.DbTablePrefix + "ProductInfo", BaseDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Name).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Specification).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Unit).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.VolumeUnit).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.WeightUnit).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Brand).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Indexes
            b.HasIndex(q => q.Sku);
            b.HasIndex(q => q.Name);
            b.HasIndex(q => q.ClassifyId);
            b.HasIndex(q => q.TenantId);
            b.HasIndex(q => q.IsDeleted);
        });

        builder.Entity<UnboxProduct>(b =>
        {
            //Configure table & schema name
            b.ToTable(BaseDbProperties.DbTablePrefix + "UnboxProduct", BaseDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            b.HasOne<ProductInfo>().WithMany(e => e.UnboxProducts).HasForeignKey(e => e.ProductInfoId).IsRequired();

            //Indexes
            b.HasIndex(q => q.Sku);
            b.HasIndex(q => q.ProductInfoId);
        });

        builder.Entity<AddressBook>(b =>
        {
            //Configure table & schema name
            b.ToTable(BaseDbProperties.DbTablePrefix + "AddressBook", BaseDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Name).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.Contact).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.ContactNumber).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Province).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.City).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Town).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Street).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.AddressDetail).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.Postcode).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(q => q.Name);
            b.HasIndex(q => q.TenantId);
        });

        builder.Entity<Classify>(b =>
        {
            //Configure table & schema name
            b.ToTable(BaseDbProperties.DbTablePrefix + "Classify", BaseDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Name).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(q => q.TenantId);
        });
    }
}
