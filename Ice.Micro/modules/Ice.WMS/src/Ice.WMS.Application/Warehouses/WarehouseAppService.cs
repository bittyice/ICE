using Ice.WMS.Core.Warehouses;
using Ice.WMS.Dtos;
using Ice.WMS.Warehouses.Dtos;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Ice.WMS.Filters.MaxResources;
using Ice.Utils;

namespace Ice.WMS.Warehouses
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class WarehouseAppService : WMSAppService
    {
        protected IRepository<Warehouse, Guid> WarehouseRepository { get; }

        protected WarehouseManager WarehouseManager { get; }

        public WarehouseAppService(
            IRepository<Warehouse, Guid> warehouseRepository,
            WarehouseManager warehouseManager
        ) {
            WarehouseRepository = warehouseRepository;
            WarehouseManager = warehouseManager;
        }

        public async Task<PagedResultDto<WarehouseDto>> GetListAsync(GetListInput input) {
            var sorting = input.Sorting;
            if (
                sorting != nameof(Warehouse.CreationTime)
                && sorting != nameof(Warehouse.Id)
                && sorting != nameof(Warehouse.Code)
                && sorting != nameof(Warehouse.Name)
                ) 
            {
                sorting = nameof(Warehouse.CreationTime);
            }

            IQueryable<Warehouse> queryable = await WarehouseRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Code))
            {
                queryable = queryable.Where(e => e.Code == input.Code);
            }

            if (!string.IsNullOrWhiteSpace(input.Name))
            {
                queryable = queryable.Where(e => e.Name == input.Name);
            }

            if (input.CreationTimeMin != null) {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null) {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            long count = queryable.Count();
            List<Warehouse> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<WarehouseDto>(
                count,
                ObjectMapper.Map<List<Warehouse>, List<WarehouseDto>>(list)
            );
        }

        public async Task<WarehouseDto> GetAsync(Guid id) {
            var entity = await WarehouseRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Warehouse, WarehouseDto>(entity);
        }

        [WarehouseResource]
        public async Task CreateAsync(CreateInput input) {
            var warehouse = new Warehouse(GuidGenerator.Create(), input.Code, CurrentTenant.Id.Value);
            warehouse.Name = input.Name;
            warehouse.Remark = input.Remark;
            warehouse.ContactNumber = input.ContactNumber;
            warehouse.Principal = input.Principal;
            warehouse.IsActive = input.IsActive;
            warehouse.EnableInboundBatch = input.EnableInboundBatch;
            warehouse.Province = input.Province;
            warehouse.City = input.City;
            warehouse.Town = input.Town;
            warehouse.Street = input.Street;
            warehouse.AddressDetail = input.AddressDetail;
            warehouse.Postcode = input.Postcode;
            await WarehouseManager.Create(warehouse);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input) {
            var warehouse = await WarehouseRepository.FindAsync(id);
            if (warehouse == null) {
                throw new EntityNotFoundException();
            }

            warehouse.Name = input.Name;
            warehouse.Remark = input.Remark;
            warehouse.ContactNumber = input.ContactNumber;
            warehouse.Principal = input.Principal;
            warehouse.IsActive = input.IsActive;
            warehouse.EnableInboundBatch = input.EnableInboundBatch;
            warehouse.Province = input.Province;
            warehouse.City = input.City;
            warehouse.Town = input.Town;
            warehouse.Street = input.Street;
            warehouse.AddressDetail = input.AddressDetail;
            warehouse.Postcode = input.Postcode;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id) {
            await WarehouseManager.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
