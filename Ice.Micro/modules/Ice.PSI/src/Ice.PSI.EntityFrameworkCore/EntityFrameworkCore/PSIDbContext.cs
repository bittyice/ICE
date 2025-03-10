using Ice.PSI.Core.Contracts;
using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.Quotes;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Ice.PSI.Core.Suppliers;
using Ice.Utils;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;
using Ice.PSI.Core.Invoicings;
using Ice.PSI.Core.ProductStocks;
using Ice.PSI.Core.PaymentMethods;

namespace Ice.PSI.EntityFrameworkCore;

[ConnectionStringName(PSIDbProperties.ConnectionStringName)]
public class PSIDbContext : AbpDbContext<PSIDbContext>, IPSIDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * public DbSet<Question> Questions { get; set; }
     */

    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    public DbSet<Quote> Quotes { get; set; }
    public DbSet<PurchaseReturnOrder> PurchaseReturnOrders { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Contract> Contracts { get; set; }
    public DbSet<SaleOrder> SaleOrders { get; set; }
    public DbSet<SaleReturnOrder> SaleReturnOrders { get; set; }
    public DbSet<Invoicing> Invoicings { get; set; }
    public DbSet<ProductStock> ProductStocks { get; set; }
    public DbSet<PaymentMethod> PaymentMethods { get; set; }

    public PSIDbContext(DbContextOptions<PSIDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ConfigurePSI();
    }
}
