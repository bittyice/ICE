using Ice.WMS.Core;
using Ice.WMS.Core.Areas;
using Ice.WMS.Core.Delivery100ExpressOrders;
using Ice.WMS.Core.Delivery100s;
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
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace Ice.WMS.EntityFrameworkCore;

[ConnectionStringName(WMSDbProperties.ConnectionStringName)]
public class WMSDbContext : AbpDbContext<WMSDbContext>, IWMSDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * public DbSet<Question> Questions { get; set; }
     */

    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<Area> Areas { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<InboundOrder> InboundOrders { get; set; }
    public DbSet<OutboundOrder> OutboundOrders { get; set; }
    public DbSet<PickList> PickLists { get; set; }
    public DbSet<WarehouseTransfer> WarehouseTransfers { get; set; }
    public DbSet<WarehouseCheck> WarehouseChecks { get; set; }
    public DbSet<WarehouseMessage> WarehouseMessages { get; set; }
    public DbSet<InventoryAlert> InventoryAlerts { get; set; }
    public DbSet<LossReportOrder> LossReportOrders { get; set; }
    public DbSet<TransferSku> TransferSkus { get; set; }
    public DbSet<StockChangeLog> StockChangeLogs { get; set; }
    public DbSet<Delivery100> Delivery100s { get; set; }
    public DbSet<Delivery100ExpressOrder> Delivery100ExpressOrders { get; set; }

    public WMSDbContext(DbContextOptions<WMSDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ConfigureWMS();
    }
}
