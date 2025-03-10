using Ice.PSI.Core.Contracts;
using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.Quotes;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Ice.PSI.Core.Suppliers;
using Ice.Utils;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Ice.PSI.Core.Invoicings;
using Ice.PSI.Core.ProductStocks;
using Ice.PSI.Core.PaymentMethods;

namespace Ice.PSI.EntityFrameworkCore;

public static class PSIDbContextModelCreatingExtensions
{
    public static void ConfigurePSI(
        this ModelBuilder builder)
    {
        Check.NotNull(builder, nameof(builder));

        builder.Entity<PurchaseOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "PurchaseOrder", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.OrderNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Remark).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Supplier>().WithMany().HasForeignKey(e => e.SupplierId).IsRequired();

            //Indexes
            b.HasIndex(e => e.OrderNumber);
            b.HasIndex(e => e.Status);
            b.HasIndex(e => e.IsSettlement);
            b.HasIndex(e => e.SupplierId);
            b.HasIndex(e => e.CreationTime);
            b.HasIndex(e => e.FinishDate);
            b.HasIndex(e => e.PaymentMethodId);
        });

        builder.Entity<PurchaseDetail>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "PurchaseDetail", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Remark).HasMaxLength(Consts.MinTextLength);       // 就是 MinTextLength，这里只需要一个简单的说明
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<PurchaseOrder>().WithMany(e => e.Details).HasForeignKey(e => e.PurchaseOrderId).IsRequired();

            //Indexes
            b.HasIndex(e => e.PurchaseOrderId);
        });

        builder.Entity<Quote>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "Quote", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(e => e.Sku);
            b.HasIndex(e => e.SupplierId);
        });

        builder.Entity<PurchaseReturnOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "PurchaseReturnOrder", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.OrderNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Reason).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.Remark).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Supplier>().WithMany().HasForeignKey(e => e.SupplierId).IsRequired();

            //Indexes
            b.HasIndex(e => e.OrderNumber);
            b.HasIndex(e => e.Status);
            b.HasIndex(e => e.IsSettlement);
            b.HasIndex(e => e.SupplierId);
            b.HasIndex(e => e.CreationTime);
            b.HasIndex(e => e.FinishDate);
            b.HasIndex(e => e.PaymentMethodId);
        });

        builder.Entity<PurchaseReturnDetail>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "PurchaseReturnDetail", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<PurchaseReturnOrder>().WithMany(e => e.Details).HasForeignKey(e => e.PurchaseReturnOrderId).IsRequired();

            //Indexes
            b.HasIndex(e => e.PurchaseReturnOrderId);
        });

        builder.Entity<Supplier>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "Supplier", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Code).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Name).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Contact).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.ContactNumber).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(e => e.Code);
            b.HasIndex(e => e.Name);
            b.HasIndex(e => e.Contact);
            b.HasIndex(e => e.ContactNumber);
        });

        builder.Entity<Contract>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "Contract", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.ContractNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.ContractName).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.AppendixUrl).HasMaxLength(Consts.MaxTextLength);
            b.Property(q => q.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(q => q.TenantId).IsRequired();

            //Indexes
            b.HasIndex(q => q.ContractNumber);
            b.HasIndex(q => q.ContractName);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.SupplierId);
            b.HasIndex(q => q.TenantId);
        });

        builder.Entity<SaleOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "SaleOrder", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.OrderNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Status).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Seller).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Remark).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.RejectReason).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.TenantId).IsRequired();

            b.OwnsOne(e => e.RecvInfo).Property(e => e.BusinessName).HasMaxLength(Consts.MinTextLength);
            b.OwnsOne(e => e.RecvInfo).Property(e => e.Contact).HasMaxLength(Consts.MinTextLength);
            b.OwnsOne(e => e.RecvInfo).Property(e => e.ContactNumber).HasMaxLength(Consts.MinTextLength);
            b.OwnsOne(e => e.RecvInfo).Property(e => e.Province).HasMaxLength(Consts.MinTextLength);
            b.OwnsOne(e => e.RecvInfo).Property(e => e.City).HasMaxLength(Consts.MinTextLength);
            b.OwnsOne(e => e.RecvInfo).Property(e => e.Town).HasMaxLength(Consts.MinTextLength);
            b.OwnsOne(e => e.RecvInfo).Property(e => e.Street).HasMaxLength(Consts.MinTextLength);
            b.OwnsOne(e => e.RecvInfo).Property(e => e.AddressDetail).HasMaxLength(Consts.MediumTextLength);
            b.OwnsOne(e => e.RecvInfo).Property(e => e.Postcode).HasMaxLength(Consts.MinTextLength);

            //Indexes
            b.HasIndex(q => q.Seller);
            b.HasIndex(q => q.OrderNumber);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(e => e.FinishDate);
            b.HasIndex(q => q.Status);
            b.HasIndex(q => q.TenantId);
            b.OwnsOne(e => e.RecvInfo).HasIndex(q => q.BusinessName);
            b.HasIndex(e => e.PaymentMethodId);
        });

        builder.Entity<SaleDetail>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "SaleDetail", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);

            //Relations
            b.HasOne<SaleOrder>().WithMany(e => e.Details).HasForeignKey(e => e.SaleOrderId).IsRequired();

            //Indexes
            b.HasIndex(q => q.SaleOrderId);
            b.HasIndex(q => q.Sku);
        });

        builder.Entity<SaleReturnOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "SaleReturnOrder", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.OrderNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.SaleNumber).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Status).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.BusinessName).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Remark).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.RejectReason).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Indexes
            b.HasIndex(q => q.OrderNumber);
            b.HasIndex(q => q.SaleNumber);
            b.HasIndex(q => q.BusinessName);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(e => e.FinishDate);
            b.HasIndex(q => q.Status);
            b.HasIndex(q => q.TenantId);
            b.HasIndex(e => e.PaymentMethodId);
        });

        builder.Entity<SaleReturnDetail>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "SaleReturnDetail", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);

            //Relations
            b.HasOne<SaleReturnOrder>().WithMany(e => e.Details).HasForeignKey(e => e.SaleReturnOrderId).IsRequired();

            //Indexes
            b.HasIndex(q => q.SaleReturnOrderId);
            b.HasIndex(q => q.Sku);
        });

        builder.Entity<Invoicing>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "Invoicing", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(q => q.Year);
            b.HasIndex(q => q.Month);
            b.HasIndex(q => q.TenantId);
        });

        builder.Entity<ProductStock>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "ProductStock", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(q => new { q.TenantId, q.Sku }).IsUnique();
        });

        builder.Entity<PaymentMethod>(b =>
        {
            //Configure table & schema name
            b.ToTable(PSIDbProperties.DbTablePrefix + "PaymentMethod", PSIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Name).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.CardNumber).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Describe).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(q => q.Name);
        });
    }
}
