using Ice.Utils;
using Ice.WMS.Core.Areas;
using Ice.WMS.Core.Locations;
using Ice.WMS.Dtos;
using Ice.WMS.Filters;
using Ice.WMS.Locations.Dtos;
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

namespace Ice.WMS.Locations
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class LocationAppService : WMSAppService
    {
        protected IRepository<Location, Guid> LocationRepository { get; }

        protected IRepository<Area, Guid> AreaRepository { get; }

        protected LocationManager LocationManager { get; }

        public LocationAppService(
            IRepository<Location, Guid> locationRepository,
            IRepository<Area, Guid> areaRepository,
            LocationManager locationManager
        )
        {
            LocationRepository = locationRepository;
            LocationManager = locationManager;
            AreaRepository = areaRepository;
        }

        public async Task<PagedResultDto<LocationDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(Location.Code);

            IQueryable<Location> queryable = await LocationRepository.GetQueryableAsync();
            if (input.AreaId.HasValue) {
                queryable = queryable.Where(e => e.AreaId == input.AreaId);
            }

            if (input.WarehouseId.HasValue) {
                queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);
            }

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Code))
            {
                queryable = queryable.Where(e => e.Code == input.Code);
            }

            long count = queryable.Count();
            List<Location> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<LocationDto>(
                count,
                ObjectMapper.Map<List<Location>, List<LocationDto>>(list)
            );
        }

        public async Task<List<LocationDto>> GetAllOftenAsync(GetAllOftenInput input) {
            var list = (await LocationRepository.GetQueryableAsync()).Where(e => e.WarehouseId == input.WarehouseId && e.Often == true).ToList();
            return ObjectMapper.Map<List<Location>, List<LocationDto>>(list);
        }

        public async Task<LocationDto> GetAsync(Guid id)
        {
            var entity = await LocationRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Location, LocationDto>(entity);
        }

        public async Task<GetAllowAndForbidSpecificationsOutput> GetAllowAndForbidSpecificationsAsync(GetAllowAndForbidSpecificationsInput input) {
            var locationQuery = await LocationRepository.GetQueryableAsync();
            var areaQuery = await AreaRepository.GetQueryableAsync();

            var output = locationQuery.Where(e => e.WarehouseId == input.WarehouseId && e.Code == input.Code).Join(areaQuery, e => e.AreaId, e => e.Id, (l, a) => new GetAllowAndForbidSpecificationsOutput()
            {
                AllowSpecifications = a.AllowSpecifications,
                ForbidSpecifications = a.ForbidSpecifications
            }).FirstOrDefault();

            return output;
        }

        public async Task CreateAsync(CreateInput input)
        {
            var area = await AreaRepository.FindAsync(input.AreaId);
            if (area == null)
            {
                throw new UserFriendlyException(message: "无效的库区");
            }

            if (area.IsActive == false)
            {
                throw new UserFriendlyException(message: "库区已被禁用");
            }

            var location = new Location(GuidGenerator.Create(), input.Code, area.Id, area.WarehouseId, CurrentTenant.Id.Value);

            await LocationManager.CreateAsync(location);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task SetOftenAsync(Guid id, SetOftenInput input) {
            var entity = await LocationRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            await LocationManager.SetOften(entity, input.Often);
        }

        public async Task DeleteAsync(Guid id)
        {
            await LocationManager.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPost]
        [ActionName("import")]
        [AccessLimit(2, 25, "Location.Import")]
        public async Task ImportAsync([FromBody] ImportInput input) {
            if (input.ImportLocations.Count > 50) {
                throw new UserFriendlyException(message: "导入失败");
            }

            if (input.ImportLocations.Count == 0) {
                return;
            }

            var area = await AreaRepository.FindAsync(input.AreaId);
            if (area == null) {
                throw new UserFriendlyException(message: "无效的库区");
            }

            if (area.IsActive == false) {
                throw new UserFriendlyException(message: "库区已被禁用");
            }

            IQueryable<Location> queryable = await LocationRepository.GetQueryableAsync();
            var inputCodes = input.ImportLocations.Select(e => e.Code.Trim()).ToList();
            List<Location> existLocations = queryable.Where(e => inputCodes.Contains(e.Code)).ToList();

            List<Location> insertLocations = new List<Location>();
            input.ImportLocations.ForEach(item =>
            {
                var existLocation = existLocations.FirstOrDefault(e => e.Code == item.Code);
                if (existLocation != null) {
                    return;
                }
                var newLocation = new Location(GuidGenerator.Create(), item.Code, area.Id, area.WarehouseId, CurrentTenant.Id.Value);
                insertLocations.Add(newLocation);
            });

            await LocationRepository.InsertManyAsync(insertLocations);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task FreezeAsync(FreezeInput input) {
            await LocationManager.Freeze(input.WarehouseId, input.LocationCode, input.Sku);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task UnfreezeAsync(UnfreezeInput input) {
            await LocationManager.Unfreeze(input.WarehouseId, input.LocationCode, input.Sku);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task FreezeForInboundBatchAsync(FreezeForInboundBatchInput input) {
            await LocationManager.FreezeForInboundBatch(input.WarehouseId, input.InboundBatch);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task UnfreezeForInboundBatchAsync(UnfreezeForInboundBatchInput input) {
            await LocationManager.UnfreezeForInboundBatch(input.WarehouseId, input.InboundBatch);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPost]
        public async Task UnboxingAsync(UnboxingInput input) {
            UnboxingProduct offUnboxingProduct = new UnboxingProduct() { 
                Sku = input.UnboxSku,
                Quantity = input.UnboxQuantity
            };

            List<UnboxingProduct> onUnboxingProducts = new List<UnboxingProduct>();
            foreach (var item in input.OnshlefItems) {
                onUnboxingProducts.Add(new UnboxingProduct() { 
                    Sku = item.Sku,
                    Quantity = item.Quantity
                });
            }

            await LocationManager.Unboxing(input.WarehouseId, input.UnboxLocationCode, offUnboxingProduct, input.OnshlefLocationCode, onUnboxingProducts);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
