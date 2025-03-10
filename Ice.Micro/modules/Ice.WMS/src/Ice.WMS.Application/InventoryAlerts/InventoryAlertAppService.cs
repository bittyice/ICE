using Ice.WMS.Core.InventoryAlerts;
using Ice.WMS.InventoryAlerts.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Application.Dtos;
using Ice.WMS.Dtos;
using Volo.Abp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Ice.WMS.Filters.MaxResources;
using Ice.Utils;

namespace Ice.WMS.InventoryAlerts
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class InventoryAlertAppService : WMSAppService
    {
        protected InventoryAlertManager InventoryAlertManager { get; set; }

        protected IRepository<InventoryAlert, Guid> InventoryAlertRepository { get; set; }

        public InventoryAlertAppService(
            InventoryAlertManager inventoryAlertManager,
            IRepository<InventoryAlert, Guid> inventoryAlertRepository) 
        {
            InventoryAlertManager = inventoryAlertManager;
            InventoryAlertRepository = inventoryAlertRepository;
        }

        public async Task<PagedResultDto<InventoryAlertDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(InventoryAlert.Sku)
                && sorting != nameof(InventoryAlert.CreatorId)
                && sorting != nameof(InventoryAlert.CreationTime)
                && sorting != nameof(InventoryAlert.WarehouseId)
                )
            {
                sorting = nameof(InventoryAlert.CreationTime);
            }

            IQueryable<InventoryAlert> queryable = await InventoryAlertRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.CreatorId != null)
            {
                queryable = queryable.Where(e => e.CreatorId == input.CreatorId);
            }

            long count = queryable.Count();
            List<InventoryAlert> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<InventoryAlertDto>(
                count,
                ObjectMapper.Map<List<InventoryAlert>, List<InventoryAlertDto>>(list)
            );
        }

        public async Task<InventoryAlertDto> GetAsync(Guid id)
        {
            var entity = (await InventoryAlertRepository.FindAsync(id));
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<InventoryAlert, InventoryAlertDto>(entity);
        }

        [InventoryAlertResource]
        public async Task CreateAsync(CreateInput input)
        {
            var inventoryAlert = new InventoryAlert(GuidGenerator.Create(), input.Sku, CurrentUser.Id.Value, input.WarehouseId, CurrentTenant.Id.Value);
            inventoryAlert.Quantity = input.Quantity;
            inventoryAlert.IsActive = input.IsActive;
            await InventoryAlertManager.CreateAsync(inventoryAlert);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var inventoryAlert = (await InventoryAlertRepository.FindAsync(id));
            if (inventoryAlert == null)
            {
                throw new EntityNotFoundException();
            }
            inventoryAlert.Quantity = input.Quantity;
            inventoryAlert.IsActive = input.IsActive;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await InventoryAlertRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
