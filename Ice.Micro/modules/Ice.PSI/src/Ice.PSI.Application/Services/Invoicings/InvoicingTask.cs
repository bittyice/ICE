using Ice.PSI.Core;
using Ice.PSI.Core.Invoicings;
using Ice.PSI.Core.ProductStocks;
using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Uow;

namespace Ice.PSI.Invoicings
{
    public class InvoicingTask : ITransientDependency
    {
        public ILogger<InvoicingTask> Logger { get; }

        protected IRepository<Invoicing, Guid> InvoicingRepository { get; }

        protected IRepository<PurchaseOrder, Guid> PurchaseOrderRepository { get; }

        protected IRepository<PurchaseReturnOrder, Guid> PurchaseReturnOrderRepository { get; }

        protected IRepository<SaleOrder, Guid> SaleOrderRepository { get; }

        protected IRepository<SaleReturnOrder, Guid> SaleReturnOrderRepository { get; }

        protected IRepository<ProductStock, Guid> ProductStockRepository { get; }

        protected ICurrentTenant CurrentTenant { get; }

        protected IUnitOfWorkManager UnitOfWorkManager { get; }

        protected IDataFilter DataFilter { get; }

        public InvoicingTask(
            ILogger<InvoicingTask> logger,
            IRepository<Invoicing, Guid> invoicingRepository,
            IRepository<PurchaseOrder, Guid> purchaseOrderRepository,
            IRepository<PurchaseReturnOrder, Guid> purchaseReturnOrderRepository,
            IRepository<SaleOrder, Guid> saleOrderRepository,
            IRepository<SaleReturnOrder, Guid> saleReturnOrderRepository,
            IRepository<ProductStock, Guid> productStockRepository,
            ICurrentTenant currentTenant,
            IUnitOfWorkManager unitOfWorkManager,
            IDataFilter dataFilter)
        {
            Logger = logger;
            InvoicingRepository = invoicingRepository;
            PurchaseOrderRepository = purchaseOrderRepository;
            PurchaseReturnOrderRepository = purchaseReturnOrderRepository;
            SaleOrderRepository = saleOrderRepository;
            SaleReturnOrderRepository = saleReturnOrderRepository;
            ProductStockRepository = productStockRepository;
            CurrentTenant = currentTenant;
            UnitOfWorkManager = unitOfWorkManager;
            DataFilter = dataFilter;
        }

        /// <summary>
        /// 统计进销存
        /// 注：这里不统计货主的进销存
        /// </summary>
        /// <returns></returns>
        public async Task Handle()
        {
            // 加上12小时
            // DateTime now = new DateTime(2023, 8, 1);
            DateTime now = DateTime.Now;
            // 加上分钟，以防定时器提前1、2秒触发
            now = now.AddMinutes(1);
            // 统计的时间段
            DateTime startTime = new DateTime(now.Year, now.Month, 1).AddMonths(-1);
            DateTime endTime = new DateTime(now.Year, now.Month, 1);
            // 要统计的年月
            DateTime statisticsTime = new DateTime(now.Year, now.Month, 1).AddMonths(-1);
            int year = statisticsTime.Year;
            int month = statisticsTime.Month;

            // 获取所有租户的所有产品库存
            List<StockItem> stocks;
            // 获取所有租户上个月的进销存数据
            List<InvoicingQuery> lastInvoicings;
            using (DataFilter.Disable<IMultiTenant>())
            {
                // 不启用事务性，因为这里只读
                using (var uow = UnitOfWorkManager.Begin(requiresNew: true, isTransactional: false))
                {
                    stocks = (await ProductStockRepository.GetQueryableAsync()).Select(item => new StockItem()
                    {
                        TenantId = item.TenantId,
                        Sku = item.Sku,
                        Quantity = item.Stock
                    }).ToList();

                    // 上一个月的进行存
                    var preMonth = new DateTime(year, month, 1).AddMonths(-1);
                    lastInvoicings = (await InvoicingRepository.GetQueryableAsync()).Where(e => e.Year == preMonth.Year && e.Month == preMonth.Month).Select(e => new InvoicingQuery()
                    {
                        TenantId = e.TenantId,
                        Sku = e.Sku,
                        EndStock = e.EndStock,
                        EndAmount = e.EndAmount,
                    }).ToList();
                }
            }

            var tenantIds = stocks.Select(e => e.TenantId).Distinct();

            foreach (var tenantId in tenantIds)
            {
                using (CurrentTenant.Change(tenantId))
                {
                    using (var uow = UnitOfWorkManager.Begin(requiresNew: true, isTransactional: true))
                    {
                        try
                        {
                            // 获取上个月入库的订单
                            var purchaseStt = (await PurchaseOrderRepository.GetQueryableAsync())
                            .Where(e => e.Status == PurchaseOrderStatus.Completed)
                            .Where(e => startTime <= e.FinishDate && e.FinishDate < endTime)
                            .SelectMany(e => e.Details)
                            .GroupBy(e => e.Sku)
                            .Select(group => new QueryResult()
                            {
                                Sku = group.Key,
                                TotalQuantity = group.Sum(ie => ie.Quantity + ie.GiveQuantity),
                                TotalAmount = group.Sum(ie => ie.Price),
                            }).ToList();


                            var purchaseReturnStt = (await PurchaseReturnOrderRepository.GetQueryableAsync())
                            .Where(e => e.Status == PurchaseReturnOrderStatus.Completed)
                            .Where(e => startTime <= e.FinishDate && e.FinishDate < endTime)
                            .SelectMany(e => e.Details)
                            .GroupBy(e => e.Sku)
                            .Select(group => new QueryResult()
                            {
                                Sku = group.Key,
                                TotalQuantity = group.Sum(ie => ie.Quantity),
                                TotalAmount = group.Sum(ie => ie.Price),
                            }).ToList();


                            var saleStt = (await SaleOrderRepository.GetQueryableAsync())
                            .Where(e => e.Status == SaleOrderStatus.Completed)
                            .Where(e => startTime <= e.FinishDate && e.FinishDate < endTime)
                            .SelectMany(e => e.Details)
                            .GroupBy(e => e.Sku)
                            .Select(group => new QueryResult()
                            {
                                Sku = group.Key,
                                TotalQuantity = group.Sum(ie => ie.Quantity + ie.GiveQuantity),
                                TotalAmount = group.Sum(ie => ie.PlacePrice),
                            }).ToList();


                            var saleReturnStt = (await SaleReturnOrderRepository.GetQueryableAsync())
                            .Where(e => e.Status == SaleReturnOrderStatus.Completed)
                            .Where(e => startTime <= e.FinishDate && e.FinishDate < endTime)
                            .SelectMany(e => e.Details)
                            .GroupBy(e => e.Sku)
                            .Select(group => new QueryResult()
                            {
                                Sku = group.Key,
                                TotalQuantity = group.Sum(ie => ie.Quantity),
                                TotalAmount = group.Sum(ie => ie.UnitPrice),
                            }).ToList();

                            List<Invoicing> Invoicings = new List<Invoicing>();
                            // 当前仓库上个月进销存
                            var curInvoicings = lastInvoicings.Where(e => e.TenantId == tenantId);
                            // 获取当前的库存
                            var curstocks = stocks.Where(e => e.TenantId == tenantId);
                            // 获取要记录的SKU
                            var skus = curstocks.Select(e => e.Sku).Distinct();
                            foreach (var sku in skus)
                            {
                                // 产品上个月的进销存
                                var lastInvoicing = curInvoicings.FirstOrDefault(e => e.Sku == sku);
                                // 产品当前库存
                                var stock = curstocks.FirstOrDefault(e => e.Sku == sku);
                                // 产品入库数量
                                var purchase = purchaseStt.FirstOrDefault(e => e.Sku == sku);
                                var saleReturn = saleReturnStt.FirstOrDefault(e => e.Sku == sku);
                                // 产品出库数量
                                var purchaseReturn = purchaseReturnStt.FirstOrDefault(e => e.Sku == sku);
                                var sale = saleStt.FirstOrDefault(e => e.Sku == sku);

                                // 产品期初库存，即上个月的期末库存
                                var startStock = lastInvoicing?.EndStock ?? 0;
                                // 产品期初结余，即上个月的期末结余
                                var startAmount = lastInvoicing?.EndAmount ?? 0;
                                Invoicing invoicing = new Invoicing()
                                {
                                    Year = year,
                                    Month = month,
                                    Sku = sku,
                                    SaleQuantity = (sale?.TotalQuantity ?? 0) + (purchaseReturn?.TotalQuantity ?? 0),
                                    SaleAmount = (sale?.TotalAmount ?? 0) + (purchaseReturn?.TotalAmount ?? 0),
                                    InboundQuantity = (purchase?.TotalQuantity ?? 0) + (saleReturn?.TotalQuantity ?? 0),
                                    InboundAmount = (purchase?.TotalAmount ?? 0) + (saleReturn?.TotalAmount ?? 0),
                                    EndStock = (stock?.Quantity ?? 0),
                                };
                                // 成本价
                                int quantity = startStock + invoicing.InboundQuantity;
                                decimal cost = 0;
                                if (quantity != 0)
                                {
                                    cost = (startAmount + invoicing.InboundAmount) / quantity;
                                }
                                invoicing.EndAmount = cost * invoicing.EndStock;
                                Invoicings.Add(invoicing);
                            }

                            await InvoicingRepository.InsertManyAsync(Invoicings);
                            await uow.CompleteAsync();
                        }
                        catch (Exception ex)
                        {
                            Logger.LogError($"租户{tenantId}进销存统计失败", ex);
                        }
                    }
                }
            }
        }
    }

    public class QueryResult
    {
        public string Sku { get; set; }

        public int TotalQuantity { get; set; }

        public decimal TotalAmount { get; set; }
    }

    public class StockItem
    {
        public Guid? TenantId { get; set; }

        public string Sku { get; set; }

        public int Quantity { get; set; }
    }

    public class InvoicingQuery
    {
        public Guid? TenantId { get; set; }

        public string Sku { get; set; }

        public int EndStock { get; set; }

        public decimal EndAmount { get; set; }
    }
}
