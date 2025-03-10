using System.Linq;
using System.Threading.Tasks;
using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Ice.PSI.Core.ProductStocks;

namespace Ice.PSI.Core;

public class StockManager : DomainService
{
    protected IRepository<ProductStock> Repository { get; set; }

    public StockManager(
        IRepository<ProductStock> repository
    )
    {
        Repository = repository;
    }

    public async Task ForPurchaseOrder(PurchaseOrder order)
    {
        var skus = order.Details.Select(e => e.Sku);
        var products = await Repository.GetListAsync(e => skus.Contains(e.Sku));
        foreach (var detail in order.Details)
        {
            var product = products.Find(e => e.Sku == detail.Sku);
            if (product == null)
            {
                product = new ProductStock(detail.Sku);
                await Repository.InsertAsync(product);
            }
            product.AddStock(detail.Quantity + detail.GiveQuantity);
        }
    }

    public async Task ForClientOrder(SaleOrder order)
    {
        var skus = order.Details.Select(e => e.Sku);
        var products = await Repository.GetListAsync(e => skus.Contains(e.Sku));
        foreach (var detail in order.Details)
        {
            var product = products.Find(e => e.Sku == detail.Sku);
            if (product == null)
            {
                product = new ProductStock(detail.Sku);
                await Repository.InsertAsync(product);
            }
            product.SubStock(detail.Quantity + detail.GiveQuantity);
        }
    }

    public async Task ForPurchaseReturnOrder(PurchaseReturnOrder order)
    {
        var skus = order.Details.Select(e => e.Sku);
        var products = await Repository.GetListAsync(e => skus.Contains(e.Sku));
        foreach (var detail in order.Details)
        {
            var product = products.Find(e => e.Sku == detail.Sku);
            if (product == null)
            {
                product = new ProductStock(detail.Sku);
                await Repository.InsertAsync(product);
            }
            product.SubStock(detail.Quantity);
        }
    }

    public async Task ForClientReturnOrder(SaleReturnOrder order)
    {
        var skus = order.Details.Select(e => e.Sku);
        var products = await Repository.GetListAsync(e => skus.Contains(e.Sku));
        foreach (var detail in order.Details)
        {
            var product = products.Find(e => e.Sku == detail.Sku);
            if (product == null)
            {
                product = new ProductStock(detail.Sku);
                await Repository.InsertAsync(product);
            }
            product.AddStock(detail.Quantity);
        }
    }
}