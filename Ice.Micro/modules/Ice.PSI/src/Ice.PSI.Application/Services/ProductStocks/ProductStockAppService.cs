

using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ice.PSI.Core;
using Ice.PSI.Core.ProductStocks;
using Ice.PSI.Dtos;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Ice.PSI.Services.ProductStocks;

[Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
public class ProductStockAppService : PSIAppService
{
    protected StockManager StockManager { get; }

    protected IRepository<ProductStock> ProductStockRepository { get; }

    public ProductStockAppService(
        StockManager stockManager,
        IRepository<ProductStock> productStockRepository
    )
    {
        StockManager = stockManager;
        ProductStockRepository = productStockRepository;
    }

    public async Task<List<ProductStockDto>> GetListForSkus(GetListForSkusInput input)
    {
        var list = await ProductStockRepository.GetListAsync(e => input.Skus.Contains(e.Sku));
        return ObjectMapper.Map<List<ProductStock>, List<ProductStockDto>>(list);
    }

    public async Task SetStocks(SetStocksInput input)
    {
        var skus = input.Items.Select(e => e.Sku).ToList();
        var productStocks = await ProductStockRepository.GetListAsync(e => skus.Contains(e.Sku));
        foreach (var item in input.Items)
        {
            var productStock = productStocks.FirstOrDefault(e => e.Sku == item.Sku);
            if (productStock == null)
            {
                productStock = new ProductStock(item.Sku);
                await ProductStockRepository.InsertAsync(productStock);
            }
            productStock.SetStock(item.Stock);
        }
    }

    [ActionName("add-stocks")]
    public async Task AddStocks(AddStocksInput input)
    {
        var skus = input.Items.Select(e => e.Sku).ToList();
        var productStocks = await ProductStockRepository.GetListAsync(e => skus.Contains(e.Sku));
        foreach (var item in input.Items)
        {
            var productStock = productStocks.FirstOrDefault(e => e.Sku == item.Sku);
            if (productStock == null)
            {
                productStock = new ProductStock(item.Sku);
                await ProductStockRepository.InsertAsync(productStock);
            }
            productStock.AddStock(item.Stock);
        }
    }
}
