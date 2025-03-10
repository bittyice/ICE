using Ice.Utils;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.Locations;
using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Kanbans.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Caching;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.Kanbans
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class KanbanAppService : WMSAppService
    {
        protected IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        protected IRepository<InboundOrder, Guid> InboundOrderRepository { get; }

        protected IRepository<Location, Guid> LocationRepository { get; }

        protected IDistributedCache<GetOrderQuantityOutput> OrderQuantityDistributedCache { get; }

        protected IDistributedCache<GetOrderMonthQuantityOutput> OrderMonthQuantityDistributedCache { get; }

        public KanbanAppService(
            IRepository<OutboundOrder, Guid> outboundOrderRepository,
            IRepository<InboundOrder, Guid> inboundOrderRepository,
            IRepository<Location, Guid> locationRepository,
            IDistributedCache<GetOrderQuantityOutput> orderQuantityDistributedCache,
            IDistributedCache<GetOrderMonthQuantityOutput> orderMonthQuantityDistributedCache)
        {
            OutboundOrderRepository = outboundOrderRepository;
            InboundOrderRepository = inboundOrderRepository;
            LocationRepository = locationRepository;
            OrderQuantityDistributedCache = orderQuantityDistributedCache;
            OrderMonthQuantityDistributedCache = orderMonthQuantityDistributedCache;
        }

        /// <summary>
        /// 出库单量数据
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<GetOrderQuantityOutput> GetOrderQuantityAsync(GetOrderQuantityInput input)
        {
            var result = OrderQuantityDistributedCache.Get(input.WarehouseId.ToString());
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

            IQueryable<OutboundOrder> outqueryable = (await OutboundOrderRepository.GetQueryableAsync())
                .Where(e => e.WarehouseId == input.WarehouseId && e.Status == Core.OutboundOrderStatus.Outofstock);

            IQueryable<InboundOrder> inqueryable = (await InboundOrderRepository.GetQueryableAsync())
                .Where(e => e.WarehouseId == input.WarehouseId && e.Status == Core.InboundOrderStatus.Shelfed);

            InOutSkuNum week = new InOutSkuNum()
            {
                In = inqueryable.Where(e => e.CreationTime > startWeek).SelectMany(e => e.InboundDetails).Sum(e => e.ShelvesQuantity),
                Out = outqueryable.Where(e => e.CreationTime > startWeek).SelectMany(e => e.OutboundDetails).Sum(e => e.SortedQuantity)
            };

            InOutSkuNum month = new InOutSkuNum()
            {
                In = inqueryable.Where(e => e.CreationTime > startMonth).SelectMany(e => e.InboundDetails).Sum(e => e.ShelvesQuantity),
                Out = outqueryable.Where(e => e.CreationTime > startMonth).SelectMany(e => e.OutboundDetails).Sum(e => e.SortedQuantity)
            };

            InOutSkuNum quarter = new InOutSkuNum()
            {
                In = inqueryable.Where(e => e.CreationTime > startQuarter).SelectMany(e => e.InboundDetails).Sum(e => e.ShelvesQuantity),
                Out = outqueryable.Where(e => e.CreationTime > startQuarter).SelectMany(e => e.OutboundDetails).Sum(e => e.SortedQuantity)
            };

            InOutSkuNum year = new InOutSkuNum()
            {
                In = inqueryable.Where(e => e.CreationTime > startYear).SelectMany(e => e.InboundDetails).Sum(e => e.ShelvesQuantity),
                Out = outqueryable.Where(e => e.CreationTime > startYear).SelectMany(e => e.OutboundDetails).Sum(e => e.SortedQuantity)
            };

            result = new GetOrderQuantityOutput()
            {
                Week = week,
                Month = month,
                Quarter = quarter,
                Year = year,
            };

            OrderQuantityDistributedCache.Set(input.WarehouseId.ToString(), result, new DistributedCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = new TimeSpan(4, 0, 0),
            });

            return result;
        }

        /// <summary>
        /// 出库SKU排名
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<List<GetSkuRankingOutputItem>> GetSkuRanking(GetSkuRankingInput input)
        {
            DateTime dt = DateTime.Now.AddMonths(-1);

            IQueryable<OutboundOrder> outqueryable = (await OutboundOrderRepository.GetQueryableAsync())
                .Where(e => e.WarehouseId == input.WarehouseId && e.Status == Core.OutboundOrderStatus.Outofstock);

            var list = outqueryable.Where(e => e.CreationTime > dt).SelectMany(e => e.OutboundDetails)
            .GroupBy(e => e.Sku)
            .Select(e => new GetSkuRankingOutputItem()
            {
                Sku = e.Key,
                Quantity = e.Sum(ie => ie.SortedQuantity)
            })
            .OrderByDescending(e => e.Quantity)
            .Take(10)
            .ToList();

            return list;
        }

        /// <summary>
        /// 过去一年各个月的出入库单量趋势图
        /// </summary>
        /// <returns></returns>
        public async Task<GetOrderMonthQuantityOutput> GetOrderMonthQuantityAsync(GetPendingOrderCountInput input)
        {
            var result = OrderMonthQuantityDistributedCache.Get(input.WarehouseId.ToString());
            if (result != null)
            {
                return result;
            }

            // 本月月初
            DateTime dt = DateTime.Now.AddDays(1 - DateTime.Now.Day);
            DateTime queryStartTime = dt.AddMonths(-11);

            IQueryable<InboundOrder> inboundOrderQueryable = (await InboundOrderRepository.GetQueryableAsync()).Where(e => e.CreationTime > queryStartTime && e.Status == Core.InboundOrderStatus.Shelfed && e.WarehouseId == input.WarehouseId);
            var inboundOrderStatistics = inboundOrderQueryable.GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month }).Select(e => new GetOrderMonthQuantityOutput.StatisticOfTime()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Quantity = e.Count(),
            }).ToList();

            IQueryable<OutboundOrder> outboundOrderQueryable = (await OutboundOrderRepository.GetQueryableAsync()).Where(e => e.CreationTime > queryStartTime && e.Status == Core.OutboundOrderStatus.Outofstock && e.WarehouseId == input.WarehouseId);
            var outboundOrderStatistics = outboundOrderQueryable.GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month }).Select(e => new GetOrderMonthQuantityOutput.StatisticOfTime()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Quantity = e.Count(),
            }).ToList();

            result = new GetOrderMonthQuantityOutput()
            {
                Inbound = inboundOrderStatistics,
                Outbound = outboundOrderStatistics,
            };

            OrderMonthQuantityDistributedCache.Set(input.WarehouseId.ToString(), result, new DistributedCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = new TimeSpan(4, 0, 0),
            });

            return result;
        }

        /// <summary>
        /// 待处理订单数量
        /// </summary>
        /// <returns></returns>
        public async Task<GetPendingOrderCountOutput> GetPendingOrderCountAsync(GetPendingOrderCountInput input)
        {
            int inboundCount = await InboundOrderRepository.CountAsync(e => e.Status == Core.InboundOrderStatus.PendingReceipt && e.WarehouseId == input.WarehouseId);
            int outboundCount = await OutboundOrderRepository.CountAsync(e => e.Status == Core.OutboundOrderStatus.ToBePicked && e.WarehouseId == input.WarehouseId);

            return new GetPendingOrderCountOutput()
            {
                Inbound = inboundCount,
                Outbound = outboundCount,
            };
        }

        /// <summary>
        /// 库位空置率
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<GetVacancyRateOutput> GetVacancyRateAsync(GetVacancyRateInput input)
        {
            var queryable = (await LocationRepository.GetQueryableAsync()).Where(e => e.WarehouseId == input.WarehouseId);
            long quantity = queryable.Where(e => e.LocationDetails.Count == 0).Count();
            long total = queryable.Count();

            return new GetVacancyRateOutput()
            {
                Quantity = quantity,
                Total = total
            };
        }
    }
}
