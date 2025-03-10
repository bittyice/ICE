using Ice.PSI.Core;
using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Caching;
using Volo.Abp.Domain.Repositories;

namespace Ice.PSI.Services.Kanbans
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class KanbanHomeAppService : PSIAppService
    {
        protected IRepository<PurchaseOrder, Guid> PurchaseOrderRepository { get; }

        protected IRepository<PurchaseReturnOrder, Guid> PurchaseReturnOrderRepository { get; }

        protected IRepository<SaleOrder, Guid> SaleOrderRepository { get; }

        protected IDistributedCache<GetOrderTimeStatisticsOutput> OrderTimeStatisticsDistributedCache { get; }

        protected IDistributedCache<GetOrderMonthQuantityOutput> OrderMonthQuantityDistributedCache { get; }

        protected IRepository<SaleReturnOrder, Guid> SaleReturnOrderRepository { get; }

        public KanbanHomeAppService(
            IRepository<PurchaseOrder, Guid> purchaseOrderRepository,
            IRepository<PurchaseReturnOrder, Guid> purchaseReturnOrderRepository,
            IRepository<SaleOrder, Guid> saleOrderRepository,
            IDistributedCache<GetOrderTimeStatisticsOutput> orderTimeStatisticsDistributedCache,
            IDistributedCache<GetOrderMonthQuantityOutput> orderMonthQuantityDistributedCache,
            IRepository<SaleReturnOrder, Guid> saleReturnOrderRepository)
        {
            PurchaseOrderRepository = purchaseOrderRepository;
            PurchaseReturnOrderRepository = purchaseReturnOrderRepository;
            SaleOrderRepository = saleOrderRepository;
            OrderTimeStatisticsDistributedCache = orderTimeStatisticsDistributedCache;
            OrderMonthQuantityDistributedCache = orderMonthQuantityDistributedCache;
            SaleReturnOrderRepository = saleReturnOrderRepository;
        }

        /// <summary>
        /// 获取订单各个时段的统计，本周，本月，本季度，本年
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<GetOrderTimeStatisticsOutput> GetOrderTimeStatisticsAsync()
        {
            var result = OrderTimeStatisticsDistributedCache.Get(CurrentTenant.Id.Value.ToString());
            if (result != null)
            {
                return result;
            }

            DateTime now = DateTime.Now;
            DateTime dt = new DateTime(now.Year, now.Month, now.Day);  //当前时间

            DateTime startWeek = dt.AddDays(1 - Convert.ToInt32(dt.DayOfWeek.ToString("d")));  //本周周一

            DateTime startMonth = dt.AddDays(1 - dt.Day);  //本月月初

            DateTime startQuarter = dt.AddMonths(0 - (dt.Month - 1) % 3).AddDays(1 - dt.Day);  //本季度初

            DateTime startYear = new DateTime(dt.Year, 1, 1);  //本年年初

            // 采购统计
            IQueryable<PurchaseOrder> pqueryable = await PurchaseOrderRepository.GetQueryableAsync();
            pqueryable = pqueryable.Where(e => e.Status == PurchaseOrderStatus.Completed);

            var pweektotal = pqueryable.Where(e => e.FinishDate > startWeek).Count();
            var pweekfeetotal = pqueryable.Where(e => e.FinishDate > startWeek).Sum(e => e.Price);
            var pmonthtotal = pqueryable.Where(e => e.FinishDate > startMonth).Count();
            var pmonthfeetotal = pqueryable.Where(e => e.FinishDate > startMonth).Sum(e => e.Price);
            var pquartertotal = pqueryable.Where(e => e.FinishDate > startQuarter).Count();
            var pquartfeetotal = pqueryable.Where(e => e.FinishDate > startQuarter).Sum(e => e.Price);
            var pyeartotal = pqueryable.Where(e => e.FinishDate > startYear).Count();
            var pyearfeetotal = pqueryable.Where(e => e.FinishDate > startYear).Sum(e => e.Price);
            var ptotal = pqueryable.Count();
            var pfeetotal = pqueryable.Sum(e => e.Price);

            var purchaseStatistic = new GetOrderTimeStatisticsOutput.OrderTimeStatistic()
            {
                WeekTotal = pweektotal,
                WeekFeeTotal = pweekfeetotal,
                MonthTotal = pmonthtotal,
                MonthFeeTotal = pmonthfeetotal,
                QuarterTotal = pquartertotal,
                QuarterFeeTotal = pquartfeetotal,
                YearTotal = pyeartotal,
                YearFeeTotal = pyearfeetotal,
                Total = ptotal,
                FeeTotal = pfeetotal
            };

            // 采购退货统计
            IQueryable<PurchaseReturnOrder> rqueryable = await PurchaseReturnOrderRepository.GetQueryableAsync();
            rqueryable = rqueryable.Where(e => e.Status == PurchaseReturnOrderStatus.Completed);

            var rweektotal = rqueryable.Where(e => e.FinishDate > startWeek).Count();
            var rweekfeetotal = rqueryable.Where(e => e.FinishDate > startWeek).Sum(e => e.Price);
            var rmonthtotal = rqueryable.Where(e => e.FinishDate > startMonth).Count();
            var rmonthfeetotal = rqueryable.Where(e => e.FinishDate > startMonth).Sum(e => e.Price);
            var rquartertotal = rqueryable.Where(e => e.FinishDate > startQuarter).Count();
            var rquartfeetotal = rqueryable.Where(e => e.FinishDate > startQuarter).Sum(e => e.Price);
            var ryeartotal = rqueryable.Where(e => e.FinishDate > startYear).Count();
            var ryearfeetotal = rqueryable.Where(e => e.FinishDate > startYear).Sum(e => e.Price);
            var rtotal = rqueryable.Count();
            var rfeetotal = rqueryable.Sum(e => e.Price);

            var returnStatistic = new GetOrderTimeStatisticsOutput.OrderTimeStatistic()
            {
                WeekTotal = rweektotal,
                WeekFeeTotal = rweekfeetotal,
                MonthTotal = rmonthtotal,
                MonthFeeTotal = rmonthfeetotal,
                QuarterTotal = rquartertotal,
                QuarterFeeTotal = rquartfeetotal,
                YearTotal = ryeartotal,
                YearFeeTotal = ryearfeetotal,
                Total = rtotal,
                FeeTotal = rfeetotal
            };

            // 销售统计
            IQueryable<SaleOrder> squeryable = await SaleOrderRepository.GetQueryableAsync();
            squeryable = squeryable.Where(e => e.Status == SaleOrderStatus.Completed);

            var sweektotal = squeryable.Where(e => e.FinishDate > startWeek).Count();
            var sweekfeetotal = squeryable.Where(e => e.FinishDate > startWeek).Sum(e => e.TotalPrice);
            var smonthtotal = squeryable.Where(e => e.FinishDate > startMonth).Count();
            var smonthfeetotal = squeryable.Where(e => e.FinishDate > startMonth).Sum(e => e.TotalPrice);
            var squartertotal = squeryable.Where(e => e.FinishDate > startQuarter).Count();
            var squartfeetotal = squeryable.Where(e => e.FinishDate > startQuarter).Sum(e => e.TotalPrice);
            var syeartotal = squeryable.Where(e => e.FinishDate > startYear).Count();
            var syearfeetotal = squeryable.Where(e => e.FinishDate > startYear).Sum(e => e.TotalPrice);
            var stotal = squeryable.Count();
            var sfeetotal = squeryable.Sum(e => e.TotalPrice);

            var saleStatistic = new GetOrderTimeStatisticsOutput.OrderTimeStatistic()
            {
                WeekTotal = sweektotal,
                WeekFeeTotal = sweekfeetotal,
                MonthTotal = smonthtotal,
                MonthFeeTotal = smonthfeetotal,
                QuarterTotal = squartertotal,
                QuarterFeeTotal = squartfeetotal,
                YearTotal = syeartotal,
                YearFeeTotal = syearfeetotal,
                Total = stotal,
                FeeTotal = sfeetotal
            };

            // 销售退货统计
            IQueryable<SaleReturnOrder> srqueryable = await SaleReturnOrderRepository.GetQueryableAsync();
            srqueryable = srqueryable.Where(e => e.Status == SaleReturnOrderStatus.Completed);

            var srweektotal = srqueryable.Where(e => e.FinishDate > startWeek).Count();
            var srweekfeetotal = srqueryable.Where(e => e.FinishDate > startWeek).Sum(e => e.TotalPrice);
            var srmonthtotal = srqueryable.Where(e => e.FinishDate > startMonth).Count();
            var srmonthfeetotal = srqueryable.Where(e => e.FinishDate > startMonth).Sum(e => e.TotalPrice);
            var srquartertotal = srqueryable.Where(e => e.FinishDate > startQuarter).Count();
            var srquartfeetotal = srqueryable.Where(e => e.FinishDate > startQuarter).Sum(e => e.TotalPrice);
            var sryeartotal = srqueryable.Where(e => e.FinishDate > startYear).Count();
            var sryearfeetotal = srqueryable.Where(e => e.FinishDate > startYear).Sum(e => e.TotalPrice);
            var srtotal = srqueryable.Count();
            var srfeetotal = srqueryable.Sum(e => e.TotalPrice);

            var saleReturnStatistic = new GetOrderTimeStatisticsOutput.OrderTimeStatistic()
            {
                WeekTotal = srweektotal,
                WeekFeeTotal = srweekfeetotal,
                MonthTotal = srmonthtotal,
                MonthFeeTotal = srmonthfeetotal,
                QuarterTotal = srquartertotal,
                QuarterFeeTotal = srquartfeetotal,
                YearTotal = sryeartotal,
                YearFeeTotal = sryearfeetotal,
                Total = srtotal,
                FeeTotal = srfeetotal
            };

            result = new GetOrderTimeStatisticsOutput()
            {
                Purchase = purchaseStatistic,
                PurchaseReturn = returnStatistic,
                Sale = saleStatistic,
                SaleReturn = saleReturnStatistic
            };

            OrderTimeStatisticsDistributedCache.Set(CurrentTenant.Id.Value.ToString(), result, new DistributedCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = new TimeSpan(4, 0, 0),
            });

            return result;
        }

        /// <summary>
        /// 过去一年各个月的出入库单量趋势图
        /// </summary>
        /// <returns></returns>
        public async Task<GetOrderMonthQuantityOutput> GetOrderMonthQuantityAsync()
        {
            var result = OrderMonthQuantityDistributedCache.Get(CurrentTenant.Id.Value.ToString());
            if (result != null)
            {
                return result;
            }

            // 本月月初
            DateTime dt = DateTime.Now.AddDays(1 - DateTime.Now.Day);
            DateTime queryStartTime = dt.AddMonths(-11);

            IQueryable<PurchaseOrder> purchaseOrderQueryable = (await PurchaseOrderRepository.GetQueryableAsync()).Where(e => e.FinishDate > queryStartTime && e.Status == PurchaseOrderStatus.Completed);
            var purchaseOrderStatistics = purchaseOrderQueryable.GroupBy(e => new { e.FinishDate.Value.Year, e.FinishDate.Value.Month }).Select(e => new GetOrderMonthQuantityOutput.StatisticOfTime()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Quantity = e.Count(),
                TotalFee = e.Sum(ie => ie.Price)
            }).ToList();

            IQueryable<PurchaseReturnOrder> purchaseReturnOrderQueryable = (await PurchaseReturnOrderRepository.GetQueryableAsync()).Where(e => e.FinishDate > queryStartTime && e.Status == PurchaseReturnOrderStatus.Completed);
            var returnOrderStatistics = purchaseReturnOrderQueryable.GroupBy(e => new { e.FinishDate.Value.Year, e.FinishDate.Value.Month }).Select(e => new GetOrderMonthQuantityOutput.StatisticOfTime()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Quantity = e.Count(),
                TotalFee = e.Sum(ie => ie.Price)
            }).ToList();

            IQueryable<SaleOrder> saleOrderQueryable = (await SaleOrderRepository.GetQueryableAsync()).Where(e => e.FinishDate > queryStartTime && e.Status == SaleOrderStatus.Completed);
            var saleOrderStatistics = saleOrderQueryable.GroupBy(e => new { e.FinishDate.Value.Year, e.FinishDate.Value.Month }).Select(e => new GetOrderMonthQuantityOutput.StatisticOfTime()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Quantity = e.Count(),
                TotalFee = e.Sum(ie => ie.TotalPrice)
            }).ToList();

            IQueryable<SaleReturnOrder> saleReturnOrderQueryable = (await SaleReturnOrderRepository.GetQueryableAsync()).Where(e => e.FinishDate > queryStartTime && e.Status == SaleReturnOrderStatus.Completed);
            var saleReturnOrderStatistics = saleReturnOrderQueryable.GroupBy(e => new { e.FinishDate.Value.Year, e.FinishDate.Value.Month }).Select(e => new GetOrderMonthQuantityOutput.StatisticOfTime()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Quantity = e.Count(),
                TotalFee = e.Sum(ie => ie.TotalPrice)
            }).ToList();

            result = new GetOrderMonthQuantityOutput()
            {
                Purchase = purchaseOrderStatistics,
                PurchaseReturn = returnOrderStatistics,
                Sale = saleOrderStatistics,
                SaleReturn = saleReturnOrderStatistics
            };

            OrderMonthQuantityDistributedCache.Set(CurrentTenant.Id.Value.ToString(), result, new DistributedCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = new TimeSpan(4, 0, 0),
            });

            return result;
        }

        /// <summary>
        /// 待处理订单数量
        /// </summary>
        /// <returns></returns>
        public async Task<GetPendingOrderCountOutput> GetPendingOrderCountAsync()
        {
            int purchaseOrderCount = await PurchaseOrderRepository.CountAsync(e => e.Status == PurchaseOrderStatus.PendingReview);
            int purchaseReturnOrderCount = await PurchaseReturnOrderRepository.CountAsync(e => e.Status == PurchaseReturnOrderStatus.PendingReview);
            int saleOrderCount = await SaleOrderRepository.CountAsync(e => e.Status == SaleOrderStatus.WaitConfirm);
            int saleReturnOrderCount = await SaleReturnOrderRepository.CountAsync(e => e.Status == SaleReturnOrderStatus.WaitConfirm);

            return new GetPendingOrderCountOutput()
            {
                PurchaseCount = purchaseOrderCount,
                PurchaseReturnCount = purchaseReturnOrderCount,
                SaleCount = saleOrderCount,
                SaleReturnCount = saleReturnOrderCount,
            };
        }

        /// <summary>
        /// 出库SKU排名
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<List<GetSkuRankingOutputItem>> GetSkuRanking()
        {
            DateTime dt = DateTime.Now.AddMonths(-1);

            IQueryable<SaleOrder> outqueryable = (await SaleOrderRepository.GetQueryableAsync())
                .Where(e => e.Status == SaleOrderStatus.Completed);

            var list = outqueryable.Where(e => e.CreationTime > dt).SelectMany(e => e.Details)
            .GroupBy(e => e.Sku)
            .Select(e => new GetSkuRankingOutputItem()
            {
                Sku = e.Key,
                Quantity = e.Sum(ie => ie.Quantity + ie.GiveQuantity)
            })
            .OrderByDescending(e => e.Quantity)
            .Take(10)
            .ToList();

            return list;
        }


        public class GetOrderTimeStatisticsOutput
        {
            public OrderTimeStatistic Purchase { get; set; }

            public OrderTimeStatistic PurchaseReturn { get; set; }

            public OrderTimeStatistic Sale { get; set; }

            public OrderTimeStatistic SaleReturn { get; set; }

            public class OrderTimeStatistic
            {
                public long WeekTotal { get; set; }

                public decimal WeekFeeTotal { get; set; }

                public long MonthTotal { get; set; }

                public decimal MonthFeeTotal { get; set; }

                public long QuarterTotal { get; set; }

                public decimal QuarterFeeTotal { get; set; }

                public long YearTotal { get; set; }

                public decimal YearFeeTotal { get; set; }

                public long Total { get; set; }

                public decimal FeeTotal { get; set; }
            }
        }

        public class GetOrderMonthQuantityOutput
        {
            public class StatisticOfTime
            {
                public int Year { get; set; }

                public int Month { get; set; }

                public long Quantity { get; set; }

                public decimal TotalFee { get; set; }
            }

            public List<StatisticOfTime> Purchase { get; set; }

            public List<StatisticOfTime> PurchaseReturn { get; set; }

            public List<StatisticOfTime> Sale { get; set; }

            public List<StatisticOfTime> SaleReturn { get; set; }
        }

        public class GetPendingOrderCountOutput
        {
            public int PurchaseCount { get; set; }

            public int PurchaseReturnCount { get; set; }

            public int SaleCount { get; set; }

            public int SaleReturnCount { get; set; }
        }
    }
}
