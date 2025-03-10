using Ice.WMS.Core.Locations;
using Ice.WMS.Core.PickLists;
using Ice.WMS.Dtos;
using Ice.WMS.LocationDetails.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using static Ice.WMS.LocationDetails.Dtos.GetPickListLocationDetailsOutput;
using static Ice.WMS.LocationDetails.Dtos.GetSkuQuantityOutput;
using Ice.WMS.Core.OutboundOrders;
using Ice.Utils;

namespace Ice.WMS.LocationDetails
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class LocationDetailAppService : WMSAppService
    {
        protected IRepository<LocationDetail, Guid> LocationDetailRepository { get; }

        protected IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        public LocationDetailAppService(
            IRepository<LocationDetail, Guid> locationDetailRepository,
            IRepository<OutboundOrder, Guid> outboundOrderRepository
        )
        {
            LocationDetailRepository = locationDetailRepository;
            OutboundOrderRepository = outboundOrderRepository;
        }

        public async Task<PagedResultDto<LocationDetailDtoEX>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(LocationDetail.Sku) &&
                sorting != nameof(LocationDetail.InboundBatch) &&
                sorting != nameof(LocationDetail.LocationId) &&
                sorting != nameof(LocationDetail.ShelfLise)
                )
            {
                sorting = nameof(LocationDetail.InboundBatch);
            }

            IQueryable<LocationDetail> queryable = await LocationDetailRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.Location.WarehouseId == input.WarehouseId);

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            if (!string.IsNullOrWhiteSpace(input.InboundBatch))
            {
                queryable = queryable.Where(e => e.InboundBatch == input.InboundBatch);
            }

            if (input.HasInboundBatch == true)
            {
                queryable = queryable.Where(e => e.InboundBatch != null);
            }

            if (input.HasInboundBatch == false)
            {
                queryable = queryable.Where(e => e.InboundBatch != null);
            }

            if (!string.IsNullOrWhiteSpace(input.LocationCode))
            {
                queryable = queryable.Where(e => e.Location.Code == input.LocationCode);
            }

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (input.IsFreeze != null)
            {
                queryable = queryable.Where(e => e.IsFreeze == input.IsFreeze);
            }

            if (input.ShelfLiseMin != null)
            {
                queryable = queryable.Where(e => e.ShelfLise >= input.ShelfLiseMin.Value.LocalDateTime);
            }

            if (input.ShelfLiseMax != null)
            {
                queryable = queryable.Where(e => e.ShelfLise <= input.ShelfLiseMax.Value.LocalDateTime);
            }

            long count = queryable.Count();
            List<LocationDetailDtoEX> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).Select(l => new LocationDetailDtoEX() {
                Id = l.Id,
                Sku = l.Sku,
                InboundBatch = l.InboundBatch,
                Quantity = l.Quantity,
                IsFreeze = l.IsFreeze,
                ShelfLise = l.ShelfLise,
                LocationId = l.LocationId,
                TenantId = l.TenantId,
                LocationCode = l.Location.Code
            }).ToList();

            list.ForEach(item => {
                item.ShelfLise = item.ShelfLise != null ? new DateTimeOffset(item.ShelfLise.Value.DateTime) : null;
            });

            return new PagedResultDto<LocationDetailDtoEX>(
                count,
                list
            );
        }

        /// <summary>
        /// 查询Sku库存数量
        /// </summary>
        /// <returns></returns>
        public async Task<GetSkuQuantityOutput> GetSkuQuantityAsync(GetSkuQuantityInput input) {
            if (input.Skus == null || input.Skus.Count == 0) {
                new GetSkuQuantityOutput()
                {
                    items = new List<SkuQuantity>()
                };
            }

            if (input.Skus.Count > 50) {
                throw new UserFriendlyException(message: "查询数量过多");
            }

            IQueryable<LocationDetail> queryable = await LocationDetailRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.Location.WarehouseId == input.WarehouseId && e.IsFreeze == false);

            var skuQuantitys = queryable.Where(e => input.Skus.Contains(e.Sku)).Select(e => new SkuQuantity()
            {
                Sku = e.Sku,
                Quantity = e.Quantity,
                LocationCode = e.Location.Code
            }).ToList();

            return new GetSkuQuantityOutput()
            {
                items = skuQuantitys
            };
        }

        /// <summary>
        /// 查询库位的某个SKU库存
        /// </summary>
        /// <returns></returns>
        public async Task<LocationDetailDto> GetLocationDetailForSkuAsync(GetLocationDetailForSkuInput input) {
            var locationDetail = await LocationDetailRepository.FirstOrDefaultAsync(e => e.Location.Code == input.LocationCode && e.Sku == input.Sku && e.Location.WarehouseId == input.WarehouseId);
            if (locationDetail == null) {
                throw new UserFriendlyException("SKU在该库位上没有库存");
            }

            return ObjectMapper.Map<LocationDetail, LocationDetailDto>(locationDetail);
        }

        /// <summary>
        /// 查询拣货单SKU对应的库位库存
        /// </summary>
        /// <returns></returns>
        [Route("/api/wms/location-detail/pick-list-location-details/{id}")]
        public async Task<GetPickListLocationDetailsOutput> GetPickListLocationDetails(Guid id, Guid warehouseId) {
            var skus = (await OutboundOrderRepository.GetQueryableAsync()).Where(e => e.PickListId == id).SelectMany(e => e.OutboundDetails).Select(e => e.Sku).ToList();

            var queryable = (await LocationDetailRepository.WithDetailsAsync(e => e.Location));
            queryable = queryable.Where((e) => e.Location.WarehouseId == warehouseId);
            var results = queryable.Where(e => skus.Contains(e.Sku) && e.IsFreeze == false).Select(e => new PickListLocationDetail()
            {
                Sku = e.Sku,
                Quantity = e.Quantity,
                LocationCode = e.Location.Code,
                InboundBatch = e.InboundBatch
            }).ToList();

            return new GetPickListLocationDetailsOutput()
            {
                items = results
            };
        }

        /// <summary>
        /// 获取推荐上架库位
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<GetRecommendOnShelfLocationOutput> GetRecommendOnShelfLocationAsync(GetRecommendOnShelfLocationInput input)
        {
            var queryable = (await LocationDetailRepository.GetQueryableAsync()).Where(e => e.Location.WarehouseId == input.WarehouseId && e.Sku == input.Sku && e.IsFreeze == false);
            string minQuantityLocation = queryable.OrderBy(e => e.Quantity).Select(e => e.Location.Code).FirstOrDefault();
            string maxQuantityLocation = queryable.OrderByDescending(e => e.Quantity).Select(e => e.Location.Code).FirstOrDefault();
            string someShelfLiseLocation = "";
            if (input.ShelfLise != null) {
                someShelfLiseLocation = queryable.Where(e => e.ShelfLise == input.ShelfLise.Value.LocalDateTime).Select(e => e.Location.Code).FirstOrDefault();
            }

            return new GetRecommendOnShelfLocationOutput()
            {
                MinQuantityLocation = minQuantityLocation,
                MaxQuantityLocation = maxQuantityLocation,
                SomeShelfLiseLocation = someShelfLiseLocation,
            };
        }

        /// <summary>
        /// 库存查询
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<PagedResultDto<StockInquireOutputItem>> StockInquireAsync(StockInquireInput input) {
            var sorting = nameof(LocationDetail.Sku);

            IQueryable<LocationDetail> lqueryable = await LocationDetailRepository.GetQueryableAsync();

            if (input.WarehouseId != null) {
                lqueryable = lqueryable.Where(e => e.Location.WarehouseId == input.WarehouseId);
            }

            if (!string.IsNullOrWhiteSpace(input.Sku)) {
                lqueryable = lqueryable.Where(e => e.Sku == input.Sku);
            }

            var queryable = lqueryable.GroupBy(e => e.Sku).Select(group => new StockInquireOutputItem() { Sku = group.Key, Quantity = group.Sum(e => e.Quantity) });

            long count = queryable.Count();
            var list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<StockInquireOutputItem>(
                count,
                list
            );
        }

        /// <summary>
        /// 库存查询
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<List<StockInquireOutputItem>> StockInquireForSkusAsync(StockInquireForSkusInput input)
        {
            IQueryable<LocationDetail> lqueryable = await LocationDetailRepository.GetQueryableAsync();

            if (input.WarehouseId != null)
            {
                lqueryable = lqueryable.Where(e => e.Location.WarehouseId == input.WarehouseId);
            }

            if (input.Skus != null)
            {
                lqueryable = lqueryable.Where(e => input.Skus.Contains(e.Sku));
            }

            var queryable = lqueryable.GroupBy(e => e.Sku).Select(group => new StockInquireOutputItem() { Sku = group.Key, Quantity = group.Sum(e => e.Quantity) });

            var list = queryable.ToList();

            return list;
        }
    }
}
