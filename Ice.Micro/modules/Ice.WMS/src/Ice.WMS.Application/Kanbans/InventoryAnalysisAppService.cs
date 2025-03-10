using Ice.Utils;
using Ice.WMS.Core.Locations;
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
using static Ice.WMS.Kanbans.Dtos.GetInventoryAnalysisOutput;

namespace Ice.WMS.Kanbans
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class InventoryAnalysisAppService : WMSAppService
    {
        protected IRepository<LocationDetail, Guid> LocationDetailRepository { get; }

        protected IRepository<Location, Guid> LocationRepository { get; }

        protected IDistributedCache<GetInventoryAnalysisOutput> InventoryAnalysisDistributedCache { get; }

        public InventoryAnalysisAppService(
            IRepository<LocationDetail, Guid> locationDetailRepository,
            IRepository<Location, Guid> locationRepository,
            IDistributedCache<GetInventoryAnalysisOutput> inventoryAnalysisDistributedCache) 
        {
            LocationDetailRepository = locationDetailRepository;
            LocationRepository = locationRepository;
            InventoryAnalysisDistributedCache = inventoryAnalysisDistributedCache;
        }

        public async Task<GetInventoryAnalysisOutput> GetInventoryAnalysisAsync(GetInventoryAnalysisInput input) {
            var result = InventoryAnalysisDistributedCache.Get(input.WarehouseId.ToString());
            if (result != null)
            {
                return result;
            }

            var locationDetailQuery = (await LocationDetailRepository.GetQueryableAsync()).Where(e => e.Location.WarehouseId == input.WarehouseId);
            int totalQuantity = locationDetailQuery.Sum(e => e.Quantity);
            int expiredQuantity = locationDetailQuery.Where(e => e.ShelfLise.HasValue && e.ShelfLise.Value < DateTime.Now).Sum(e => e.Quantity);
            int freezeQuantity = locationDetailQuery.Where(e => e.IsFreeze == true).Sum(e => e.Quantity);

            List<AreaLocationQuantity> areaLocationQuantitys = (await LocationRepository.GetQueryableAsync()).Where(e => e.WarehouseId == input.WarehouseId).GroupBy(e => e.AreaId).Select(e => new AreaLocationQuantity()
            {
                AreaId = e.Key,
                Quantity = e.Count()
            }).ToList();

            result = new GetInventoryAnalysisOutput()
            {
                SkuTotalQuantity = totalQuantity,
                SkuExpiredQuantity = expiredQuantity,
                SkuFreezeQuantity = freezeQuantity,
                AreaLocationQuantitys = areaLocationQuantitys
            };

            InventoryAnalysisDistributedCache.Set(input.WarehouseId.ToString(), result, new DistributedCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = new TimeSpan(4, 0, 0),
            });

            return result;
        }
    }
}
