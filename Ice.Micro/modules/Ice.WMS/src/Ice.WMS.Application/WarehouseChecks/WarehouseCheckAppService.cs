using Ice.WMS.Core.WarehouseChecks;
using Ice.WMS.Dtos;
using Ice.WMS.WarehouseChecks.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Ice.WMS.Core.Areas;
using Microsoft.AspNetCore.Mvc;
using Ice.WMS.Core;
using Volo.Abp;
using Ice.WMS.Core.Locations;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;

namespace Ice.WMS.WarehouseChecks
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class WarehouseCheckAppService : WMSAppService
    {
        protected IRepository<WarehouseCheck, Guid> WarehouseCheckRepository { get; }

        protected IRepository<Area, Guid> AreaRepository { get; }

        protected LocationManager LocationManager { get; }

        public WarehouseCheckAppService(
            IRepository<WarehouseCheck, Guid> warehouseCheckRepository,
            IRepository<Area, Guid> areaRepository,
            LocationManager locationManager)
        {
            WarehouseCheckRepository = warehouseCheckRepository;
            AreaRepository = areaRepository;
            LocationManager = locationManager;
        }

        public async Task<PagedResultDto<WarehouseCheckDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(WarehouseCheck.CreationTime)
                && sorting != nameof(WarehouseCheck.Id)
                && sorting != nameof(WarehouseCheck.Executor)
                && sorting != nameof(WarehouseCheck.AreaId)
                && sorting != nameof(WarehouseCheck.Status)
                )
            {
                sorting = nameof(WarehouseCheck.CreationTime);
            }

            IQueryable<WarehouseCheck> queryable = await WarehouseCheckRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (input.Executor != null)
            {
                queryable = queryable.Where(e => e.Executor == input.Executor);
            }

            if (input.AreaId != null)
            {
                queryable = queryable.Where(e => e.AreaId == input.AreaId);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            long count = queryable.Count();
            List<WarehouseCheck> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<WarehouseCheckDto>(
                count,
                ObjectMapper.Map<List<WarehouseCheck>, List<WarehouseCheckDto>>(list)
            );
        }

        public async Task<WarehouseCheckDto> GetAsync(Guid id)
        {
            var entity = (await WarehouseCheckRepository.GetQueryableAsync()).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<WarehouseCheck, WarehouseCheckDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            var area = await AreaRepository.FindAsync(input.AreaId);
            if (area == null)
            {
                throw new EntityNotFoundException();
            }
            var warehouseCheck = new WarehouseCheck(GuidGenerator.Create(), input.Executor, input.AreaId, area.WarehouseId, CurrentUser.Id.Value, CurrentTenant.Id.Value);

            await WarehouseCheckRepository.InsertAsync(warehouseCheck);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 作废
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task InvalidAsync(Guid id)
        {
            var warehouseCheck = await WarehouseCheckRepository.FindAsync(id);
            if (warehouseCheck == null)
            {
                throw new EntityNotFoundException();
            }

            warehouseCheck.Invalid();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 开始盘点
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task StartAsync(Guid id)
        {
            var warehouseCheck = await WarehouseCheckRepository.FindAsync(id);
            if (warehouseCheck == null)
            {
                throw new EntityNotFoundException();
            }

            warehouseCheck.Start();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 盘点
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        public async Task CheckAsync(CheckInput input)
        {
            await LocationManager.Check(input.WarehouseId, input.LocationCode, new OnOffShelfSkuInfo(input.Sku, input.Quantity, input.InboundBatch, input.ShelfLise?.LocalDateTime), input.WarehouseCheckId);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 结束盘点
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task FinishAsync(Guid id)
        {
            var warehouseCheck = await WarehouseCheckRepository.FindAsync(id);
            if (warehouseCheck == null)
            {
                throw new EntityNotFoundException();
            }
            var area = await AreaRepository.FindAsync(warehouseCheck.AreaId);
            area.Checked();
            warehouseCheck.Finish();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 删除
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task DeleteAsync(Guid id)
        {
            var warehouseCheck = await WarehouseCheckRepository.FindAsync(id);
            if (warehouseCheck == null)
            {
                throw new EntityNotFoundException();
            }

            if (warehouseCheck.Status != WarehouseCheckStatus.Invalid)
            {
                throw new UserFriendlyException(message: "需要先作废任务才能删除");
            }

            await WarehouseCheckRepository.DeleteAsync(warehouseCheck);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
