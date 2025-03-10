using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Application.Dtos;
using Ice.PSI.Core;
using Ice.PSI.Core.SaleOrders;
using Volo.Abp.Authorization;
using Ice.PSI.Core.SaleReturnOrders;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;

namespace Ice.PSI.Services.Reports
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class ReportAppService : PSIAppService
    {
        protected IRepository<PurchaseDetail> PurchaseDetailRepository { get; }

        protected IRepository<PurchaseOrder> PurchaseOrderRepository { get; }

        protected IRepository<PurchaseReturnDetail> PurchaseReturnDetailRepository { get; }

        protected IRepository<PurchaseReturnOrder> PurchaseReturnOrderRepository { get; }

        protected IRepository<SaleOrder, Guid> SaleOrderRepository { get; }

        protected IRepository<SaleReturnOrder, Guid> SaleReturnOrderRepository { get; }

        public ReportAppService(
            IRepository<PurchaseDetail> purchaseDetailRepository,
            IRepository<PurchaseOrder> purchaseOrderRepository,
            IRepository<PurchaseReturnDetail> purchaseReturnDetailRepository,
            IRepository<PurchaseReturnOrder> purchaseReturnOrderRepository,
            IRepository<SaleOrder, Guid> saleOrderRepository,
            IRepository<SaleReturnOrder, Guid> saleReturnOrderRepository)
        {
            PurchaseDetailRepository = purchaseDetailRepository;
            PurchaseOrderRepository = purchaseOrderRepository;
            PurchaseReturnDetailRepository = purchaseReturnDetailRepository;
            PurchaseReturnOrderRepository = purchaseReturnOrderRepository;
            SaleOrderRepository = saleOrderRepository;
            SaleReturnOrderRepository = saleReturnOrderRepository;
        }

        public async Task<PagedResultDto<ProductReportOutputItem>> GetPurchaseSkuReportAsync(GetPurchaseSkuReportInput input) {
            var sorting = nameof(PurchaseDetail.Sku);

            IQueryable<PurchaseDetail> pdQueryable = await PurchaseDetailRepository.GetQueryableAsync();
            IQueryable<PurchaseOrder> poQueryable = await PurchaseOrderRepository.GetQueryableAsync();

            IQueryable<ProductReportItem> queryable = pdQueryable.Join(poQueryable, pd => pd.PurchaseOrderId, po => po.Id, (pd, po) => new ProductReportItem()
            {
                Sku = pd.Sku,
                Quantity = pd.Quantity,
                UnitPrice = pd.Price,
                SupplierId = po.SupplierId,
                Status = (int) po.Status,
                CreationTime = po.CreationTime,
                FinishDate = po.FinishDate,
            });

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            if (input.SupplierId != null)
            {
                queryable = queryable.Where(e => e.SupplierId == input.SupplierId);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.FinishDateMin != null)
            {
                queryable = queryable.Where(e => e.FinishDate >= input.FinishDateMin.Value.LocalDateTime);
            }

            if (input.FinishDateMax != null)
            {
                queryable = queryable.Where(e => e.FinishDate <= input.FinishDateMax.Value.LocalDateTime);
            }

            var outputQueryable = queryable.GroupBy(e => e.Sku).Select(e => new ProductReportOutputItem()
            {
                Sku = e.Key,
                Total = e.Sum(ie => ie.Quantity),
                TotalPrice = e.Sum(ie => ie.UnitPrice * ie.Quantity)
            });
            long count = outputQueryable.Count();
            List<ProductReportOutputItem> list = outputQueryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<ProductReportOutputItem>(
                count,
                list
            );
        }

        public async Task<PagedResultDto<ProductReportOutputItem>> GetReturnSkuReportAsync(GetReturnSkuReportInput input)
        {
            var sorting = nameof(PurchaseDetail.Sku);

            IQueryable<PurchaseReturnDetail> pdQueryable = await PurchaseReturnDetailRepository.GetQueryableAsync();
            IQueryable<PurchaseReturnOrder> poQueryable = await PurchaseReturnOrderRepository.GetQueryableAsync();

            IQueryable<ProductReportItem> queryable = pdQueryable.Join(poQueryable, pd => pd.PurchaseReturnOrderId, po => po.Id, (pd, po) => new ProductReportItem()
            {
                Sku = pd.Sku,
                Quantity = pd.Quantity,
                UnitPrice = pd.Price,
                SupplierId = po.SupplierId,
                Status = (int) po.Status,
                CreationTime = po.CreationTime,
                FinishDate = po.FinishDate
            });

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            if (input.SupplierId != null)
            {
                queryable = queryable.Where(e => e.SupplierId == input.SupplierId);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.FinishDateMin != null)
            {
                queryable = queryable.Where(e => e.FinishDate >= input.FinishDateMin.Value.LocalDateTime);
            }

            if (input.FinishDateMax != null)
            {
                queryable = queryable.Where(e => e.FinishDate <= input.FinishDateMax.Value.LocalDateTime);
            }

            var outputQueryable = queryable.GroupBy(e => e.Sku).Select(e => new ProductReportOutputItem()
            {
                Sku = e.Key,
                Total = e.Sum(ie => ie.Quantity),
                TotalPrice = e.Sum(ie => ie.UnitPrice * ie.Quantity)
            });
            long count = outputQueryable.Count();
            List<ProductReportOutputItem> list = outputQueryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<ProductReportOutputItem>(
                count,
                list
            );
        }

        /// <summary>
        /// 营业额度
        /// </summary>
        /// <returns></returns>
        public async Task<GetTurnoverQuotaOutput> GetTurnoverQuotaOfDay(GetTurnoverQuotaInput input)
        {
            var now = DateTime.Now;
            // 只返回最近60天的数据
            var start = new DateTime(now.Year, now.Month, now.Day).AddDays(-60);
            var purchase = (await PurchaseOrderRepository.GetQueryableAsync()).Where(e => input.IsSettlement.HasValue ? e.IsSettlement == input.IsSettlement.Value : true).Where(e => e.CreationTime > start && e.Status == PurchaseOrderStatus.Completed).GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month, e.CreationTime.Day }).Select(e => new TurnoverQuota()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Day = e.Key.Day,
                Quota = e.Sum(e => e.Price)
            }).ToList();

            var purchaseReturns = (await PurchaseReturnOrderRepository.GetQueryableAsync()).Where(e => input.IsSettlement.HasValue ? e.IsSettlement == input.IsSettlement.Value : true).Where(e => e.CreationTime > start && e.Status == PurchaseReturnOrderStatus.Completed).GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month, e.CreationTime.Day }).Select(e => new TurnoverQuota()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Day = e.Key.Day,
                Quota = e.Sum(e => e.Price)
            }).ToList();

            var sales = (await SaleOrderRepository.GetQueryableAsync()).Where(e => input.IsSettlement.HasValue ? e.IsSettlement == input.IsSettlement.Value : true).Where(e => e.CreationTime > start && e.Status == SaleOrderStatus.Completed).GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month, e.CreationTime.Day }).Select(e => new TurnoverQuota()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Day = e.Key.Day,
                Quota = e.Sum(e => e.TotalPrice)
            }).ToList();

            var returns = (await SaleReturnOrderRepository.GetQueryableAsync()).Where(e => input.IsSettlement.HasValue ? e.IsSettlement == input.IsSettlement.Value : true).Where(e => e.CreationTime > start && e.Status == SaleReturnOrderStatus.Completed).GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month, e.CreationTime.Day }).Select(e => new TurnoverQuota()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Day = e.Key.Day,
                Quota = e.Sum(e => e.TotalPrice)
            }).ToList();

            return new GetTurnoverQuotaOutput()
            {
                Purchases = purchase,
                PurchaseReturns = purchaseReturns,
                Sales = sales,
                Returns = returns
            };
        }

        /// <summary>
        /// 营业额度
        /// </summary>
        /// <returns></returns>
        public async Task<GetTurnoverQuotaOutput> GetTurnoverQuotaOfMonth(GetTurnoverQuotaInput input)
        {
            var now = DateTime.Now;
            // 只返回最近60天的数据
            var start = new DateTime(now.Year, now.Month, 1).AddMonths(-12);
            var purchase = (await PurchaseOrderRepository.GetQueryableAsync()).Where(e => input.IsSettlement.HasValue ? e.IsSettlement == input.IsSettlement.Value : true).Where(e => e.CreationTime > start && e.Status == PurchaseOrderStatus.Completed).GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month }).Select(e => new TurnoverQuota()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Day = 1,
                Quota = e.Sum(e => e.Price)
            }).ToList();

            var purchaseReturns = (await PurchaseReturnOrderRepository.GetQueryableAsync()).Where(e => input.IsSettlement.HasValue ? e.IsSettlement == input.IsSettlement.Value : true).Where(e => e.CreationTime > start && e.Status == PurchaseReturnOrderStatus.Completed).GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month }).Select(e => new TurnoverQuota()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Day = 1,
                Quota = e.Sum(e => e.Price)
            }).ToList();

            var sales = (await SaleOrderRepository.GetQueryableAsync()).Where(e => input.IsSettlement.HasValue ? e.IsSettlement == input.IsSettlement.Value : true).Where(e => e.CreationTime > start && e.Status == SaleOrderStatus.Completed).GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month }).Select(e => new TurnoverQuota()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Day = 1,
                Quota = e.Sum(e => e.TotalPrice)
            }).ToList();

            var returns = (await SaleReturnOrderRepository.GetQueryableAsync()).Where(e => input.IsSettlement.HasValue ? e.IsSettlement == input.IsSettlement.Value : true).Where(e => e.CreationTime > start && e.Status == SaleReturnOrderStatus.Completed).GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month }).Select(e => new TurnoverQuota()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Day = 1,
                Quota = e.Sum(e => e.TotalPrice)
            }).ToList();

            return new GetTurnoverQuotaOutput()
            {
                Purchases = purchase,
                PurchaseReturns = purchaseReturns,
                Sales = sales,
                Returns = returns
            };
        }
    }
}
