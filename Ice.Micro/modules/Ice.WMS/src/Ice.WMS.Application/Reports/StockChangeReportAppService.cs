using Ice.Utils;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.Locations;
using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Reports.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Caching;
using Volo.Abp.Domain.Repositories;
using static Ice.WMS.Reports.Dtos.GetStockChangeOfWarehouseOutput;

namespace Ice.WMS.Reports
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class StockChangeReportAppService : WMSAppService
    {
        protected IRepository<LocationDetail, Guid> LocationDetailRepository { get; }

        protected IRepository<InboundDetail, Guid> InboundDetailRepository { get; }

        protected IRepository<InboundOrder, Guid> InboundOrderRepository { get; }

        protected IRepository<OutboundDetail, Guid> OutboundDetailRepository { get; }

        protected IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        protected IDistributedCache<GetStockChangeOfWarehouseOutput> StockChangeCache { get; }

        public StockChangeReportAppService(
            IRepository<LocationDetail, Guid> locationDetailRepository, 
            IRepository<InboundDetail, Guid> inboundDetailRepository,
            IRepository<InboundOrder, Guid> inboundOrderRepository,
            IRepository<OutboundDetail, Guid> outboundDetailRepository,
            IRepository<OutboundOrder, Guid> outboundOrderRepository,
            IDistributedCache<GetStockChangeOfWarehouseOutput> stockChangeCache)
        {
            LocationDetailRepository = locationDetailRepository;
            InboundDetailRepository = inboundDetailRepository;
            InboundOrderRepository = inboundOrderRepository;
            OutboundDetailRepository = outboundDetailRepository;
            OutboundOrderRepository = outboundOrderRepository;
            StockChangeCache = stockChangeCache;
        }

        /// <summary>
        /// 获取仓库18个月的库存变化
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<GetStockChangeOfWarehouseOutput> GetStockChangeOfWarehouse(GetStockChangeOfWarehouseInput input) {
            DateTime now = DateTime.Now;
            // 月初
            DateTime monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0);
            // 18个月前
            DateTime queryStartTime = monthStart.AddMonths(-18);

            var result = StockChangeCache.Get(input.WarehouseId.ToString());
            if (result != null)
            {
                return result;
            }

            // 查询当前产品库存
            IQueryable<LocationDetail> lqueryable = (await LocationDetailRepository.GetQueryableAsync()).Where(e => e.Location.WarehouseId == input.WarehouseId);
            var queryable = lqueryable.GroupBy(e => e.Sku).Select(group => new StockItem() { Sku = group.Key, Quantity = group.Sum(e => e.Quantity) });
            var stocks = queryable.ToList();

            // 查询各个月份的入库情况
            IQueryable<InboundOrder> ioqueryable = (await InboundOrderRepository.GetQueryableAsync()).Where(e => e.WarehouseId == input.WarehouseId && e.CreationTime >= queryStartTime);
            IQueryable<InboundDetail> idqueryable = (await InboundDetailRepository.GetQueryableAsync());
            IQueryable<QueryItem> iqueryable = idqueryable.Join(ioqueryable, id => id.InboundOrderId, io => io.Id, (id, io) => new QueryItem() { 
                CreationTime = io.CreationTime,
                Sku = id.Sku,
                Quantity = id.ShelvesQuantity
            });
            var inboundTotals = iqueryable.GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month, e.Sku }).Select(e => new QueryResultItem() { 
                Year = e.Key.Year,
                Month = e.Key.Month,
                Sku = e.Key.Sku,
                Total = e.Sum(ie => ie.Quantity)
            }).ToList();

            IQueryable<OutboundOrder> ooqueryable = (await OutboundOrderRepository.GetQueryableAsync()).Where(e => e.WarehouseId == input.WarehouseId && e.CreationTime >= queryStartTime);
            IQueryable<OutboundDetail> odqueryable = (await OutboundDetailRepository.GetQueryableAsync());
            IQueryable<QueryItem> oqueryable = odqueryable.Join(ooqueryable, od => od.OutboundOrderId, oo => oo.Id, (od, oo) => new QueryItem()
            {
                CreationTime = oo.CreationTime,
                Sku = od.Sku,
                Quantity = od.SortedQuantity
            });
            var outboundTotals = oqueryable.GroupBy(e => new { e.CreationTime.Year, e.CreationTime.Month, e.Sku }).Select(e => new QueryResultItem()
            {
                Year = e.Key.Year,
                Month = e.Key.Month,
                Sku = e.Key.Sku,
                Total = e.Sum(ie => ie.Quantity)
            }).ToList();

            result = new GetStockChangeOfWarehouseOutput()
            {
                CurrentStocks = stocks,
                InboundChanges = inboundTotals,
                OutboundChanges = outboundTotals
            };

            StockChangeCache.Set(input.WarehouseId.ToString(), result, new DistributedCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = new TimeSpan(8, 0, 0),
            });

            return result;
        }
    }
}
