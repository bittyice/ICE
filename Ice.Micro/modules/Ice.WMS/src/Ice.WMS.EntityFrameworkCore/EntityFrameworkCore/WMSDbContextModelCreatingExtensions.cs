using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Core.Areas;
using Ice.WMS.Core.Delivery100s;
using Ice.WMS.Core.Delivery100ExpressOrders;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.InventoryAlerts;
using Ice.WMS.Core.Locations;
using Ice.WMS.Core.LossReportOrders;
using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Core.PickLists;
using Ice.WMS.Core.StockChangeLogs;
using Ice.WMS.Core.TransferSkus;
using Ice.WMS.Core.WarehouseChecks;
using Ice.WMS.Core.WarehouseMessages;
using Ice.WMS.Core.Warehouses;
using Ice.WMS.Core.WarehouseTransfers;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Ice.WMS.EntityFrameworkCore;

public static class WMSDbContextModelCreatingExtensions
{
    public static void ConfigureWMS(
        this ModelBuilder builder)
    {
        Check.NotNull(builder, nameof(builder));

        /* Configure all entities here. Example:

        builder.Entity<Question>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "Questions", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.Title).IsRequired().HasMaxLength(QuestionConsts.MaxTitleLength);

            //Relations
            b.HasMany(question => question.Tags).WithOne().HasForeignKey(qt => qt.QuestionId);

            //Indexes
            b.HasIndex(q => q.CreationTime);
        });
        */

        builder.Entity<Warehouse>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "Warehouse", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.Code).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.Name).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.ContactNumber).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Province).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.City).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Town).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Street).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.AddressDetail).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.Postcode).HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.Principal).HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.Remark).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Indexes
            b.HasIndex(q => q.Code);
            b.HasIndex(q => q.Name);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.TenantId);
            //b.HasIndex(q => q.IsDeleted);
        });

        builder.Entity<Area>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "Area", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Code).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.AllowSpecifications).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.ForbidSpecifications).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired();

            //Indexes
            b.HasIndex(q => q.Code);
            b.HasIndex(q => q.WarehouseId);
            //b.HasIndex(q => q.TenantId);
            //b.HasIndex(q => q.IsDeleted);
        });

        builder.Entity<Location>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "Location", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Code).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Area>().WithMany().HasForeignKey(e => e.AreaId).IsRequired();
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired().OnDelete(DeleteBehavior.NoAction);

            //Indexes
            b.HasIndex(q => q.Code);
            b.HasIndex(q => q.AreaId);
            b.HasIndex(e => e.WarehouseId);
            //b.HasIndex(q => q.TenantId);
            b.HasIndex(q => q.IsDeleted);
        });

        builder.Entity<LocationDetail>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "LocationDetail", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.InboundBatch).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne(e => e.Location).WithMany(e => e.LocationDetails).HasForeignKey(e => e.LocationId).IsRequired();

            //Indexes
            b.HasIndex(q => q.Sku);
            b.HasIndex(q => q.InboundBatch);
            b.HasIndex(q => q.LocationId);
            b.HasIndex(q => q.ShelfLise);
            b.HasIndex(q => q.IsFreeze);
            b.HasIndex(q => q.TenantId);
        });

        builder.Entity<InboundOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "InboundOrder", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.InboundNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.InboundBatch).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.Type).IsRequired().HasDefaultValue(InboundOrderType.Customize);

            //Relations
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired();

            //Indexes
            b.HasIndex(q => q.InboundNumber);
            b.HasIndex(q => q.InboundBatch);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.Status);
            b.HasIndex(q => q.WarehouseId);
            b.HasIndex(q => q.Type);
            b.HasIndex(q => q.TenantId);
            b.HasIndex(q => q.IsDeleted);
            b.HasIndex(q => q.FinishTime);
        });

        builder.Entity<InboundDetail>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "InboundDetail", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Remark).HasMaxLength(Consts.MinTextLength);   // 长度就是 MinTextLength，库存明细只需要一个简单的说明即可
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<InboundOrder>().WithMany(e => e.InboundDetails).HasForeignKey(e => e.InboundOrderId).IsRequired();

            //Indexes
            b.HasIndex(q => q.InboundOrderId);
        });

        builder.Entity<OutboundOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "OutboundOrder", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.OutboundNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.RecvContact).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.RecvContactNumber).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.RecvProvince).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.RecvCity).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.RecvTown).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.RecvStreet).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.RecvAddressDetail).HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.RecvPostcode).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.OrderType).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();
            b.Property(e => e.OrderType).IsRequired().HasDefaultValue(OutboundOrderType.Customize);

            //Relations
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired();
            b.HasOne<PickList>().WithMany().HasForeignKey(e => e.PickListId).IsRequired(false);

            //Indexes
            b.HasIndex(q => q.OutboundNumber);
            b.HasIndex(q => q.RecvContact);
            b.HasIndex(q => q.RecvContactNumber);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.Status);
            b.HasIndex(q => q.WarehouseId);
            b.HasIndex(q => q.PickListId);
            b.HasIndex(q => q.OrderType);
            b.HasIndex(q => q.IsDeleted);
            b.HasIndex(q => q.TenantId);
            b.HasIndex(q => q.FinishTime);
        });

        builder.Entity<OutboundDetail>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "OutboundDetail", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<OutboundOrder>().WithMany(e => e.OutboundDetails).HasForeignKey(e => e.OutboundOrderId).IsRequired();

            //Indexes
            b.HasIndex(q => q.OutboundOrderId);
        });

        builder.Entity<PickList>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "PickList", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.PickListNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired();

            //Indexes
            b.HasIndex(q => q.PickListNumber);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.Status);
            b.HasIndex(q => q.WarehouseId);
            //b.HasIndex(q => q.TenantId);
            b.HasIndex(q => q.IsDeleted);
        });

        builder.Entity<WarehouseCheck>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "WarehouseCheck", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.CreatorId).IsRequired();
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Area>().WithMany().HasForeignKey(e => e.AreaId).IsRequired().OnDelete(DeleteBehavior.NoAction);
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired().OnDelete(DeleteBehavior.NoAction);

            //Indexes
            b.HasIndex(q => q.Status);
            b.HasIndex(q => q.Executor);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.AreaId);
            b.HasIndex(q => q.WarehouseId);
            //b.HasIndex(q => q.TenantId);
        });

        builder.Entity<WarehouseTransfer>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "WarehouseTransfer", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.TransferNumber).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.CreatorId).IsRequired();
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(q => q.TransferNumber);
            b.HasIndex(q => q.OutboundOrderId);
            b.HasIndex(q => q.InboundOrderId);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.OriginWarehouseId);
            b.HasIndex(q => q.DestinationWarehouseId);
            b.HasIndex(q => q.TenantId);
        });

        builder.Entity<InventoryAlert>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "InventoryAlert", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.CreatorId).IsRequired();
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired();

            //Indexes
            b.HasIndex(q => q.Sku);
            b.HasIndex(q => q.CreatorId);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.WarehouseId);
            //b.HasIndex(q => q.TenantId);
        });

        builder.Entity<WarehouseMessage>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "WarehouseMessage", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Title).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.Message).IsRequired().HasMaxLength(Consts.MediumTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired();

            //Indexes
            b.HasIndex(q => q.Title);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.WarehouseId);
            //b.HasIndex(q => q.TenantId);
        });

        builder.Entity<LossReportOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "LossReportOrder", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.OrderNumber).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.ExtraInfo).HasMaxLength(Consts.MaxTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired();

            //Indexes
            b.HasIndex(q => q.OrderNumber);
            b.HasIndex(q => q.Status);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => q.WarehouseId);
            b.HasIndex(q => q.IsDeleted);
        });

        builder.Entity<LossReportDetail>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "LossReportDetail", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<LossReportOrder>().WithMany(e => e.Details).HasForeignKey(e => e.LossReportOrderId).IsRequired();

            //Indexes
            b.HasIndex(q => q.LossReportOrderId);
        });

        builder.Entity<TransferSku>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "TransferSku", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.InboundBatch).HasMaxLength(Consts.MinTextLength);
            b.Property(e => e.TenantId).IsRequired();

            //Relations
            b.HasOne<Warehouse>().WithMany().HasForeignKey(e => e.WarehouseId).IsRequired();

            //Indexes
            b.HasIndex(q => q.Sku);
            b.HasIndex(q => q.WarehouseId);
        });

        builder.Entity<StockChangeLog>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "StockChangeLog", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(e => e.Sku).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.Location).HasMaxLength(Consts.MinTextLength).IsRequired();
            b.Property(e => e.WarehouseId).IsRequired();
            b.Property(e => e.TenantId).IsRequired();

            //Relations

            //Indexes
            b.HasIndex(q => q.WarehouseId);
            b.HasIndex(q => q.RelationId);
            b.HasIndex(q => q.TenantId);
        });

        builder.Entity<Delivery100>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "Delivery100", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.Kuaidicom).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.ExpType).HasMaxLength(Consts.MinTextLength);
            b.Property(q => q.PayType).HasMaxLength(Consts.MinTextLength);

            //Indexes
            b.HasIndex(q => q.TenantId);
            b.HasIndex(q => new { q.TenantId, q.Kuaidicom }).IsUnique();
        });

        builder.Entity<Delivery100ExpressOrder>(b =>
        {
            //Configure table & schema name
            b.ToTable(WMSDbProperties.DbTablePrefix + "Delivery100ExpressOrder", WMSDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.ExpressNumber).IsRequired();
            b.Property(q => q.OrderNumber).IsRequired();
            b.Property(q => q.ShipperCode).IsRequired();

            //Indexes
            b.HasIndex(q => q.TenantId);
            b.HasIndex(q => q.ExpressNumber);
            b.HasIndex(q => q.CreationTime);
            b.HasIndex(q => new { q.TenantId, q.ExpressNumber }).IsUnique();
        });
    }
}
