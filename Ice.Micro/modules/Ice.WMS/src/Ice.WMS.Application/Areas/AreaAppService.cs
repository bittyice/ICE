using Ice.Utils;
using Ice.WMS.Areas.Dtos;
using Ice.WMS.Core.Areas;
using Ice.WMS.Dtos;
using Ice.WMS.Filters.MaxResources;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.Areas
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class AreaAppService : WMSAppService
    {
        protected IRepository<Area, Guid> AreaRepository { get; }

        protected AreaManager AreaManager { get; }

        public AreaAppService(
            IRepository<Area, Guid> areaRepository,
            AreaManager areaManager
        )
        {
            AreaRepository = areaRepository;
            AreaManager = areaManager;
        }

        public async Task<PagedResultDto<AreaDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(Area.Code)
                )
            {
                sorting = nameof(Area.Code);
            }

            IQueryable<Area> queryable = await AreaRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Code))
            {
                queryable = queryable.Where(e => e.Code == input.Code);
            }

            long count = queryable.Count();
            List<Area> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<AreaDto>(
                count,
                ObjectMapper.Map<List<Area>, List<AreaDto>>(list)
            );
        }

        public async Task<AreaDto> GetAsync(Guid id)
        {
            var entity = await AreaRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Area, AreaDto>(entity);
        }

        public async Task<AreaDto> GetForCodeAsync(GetForCodeInput input)
        {
            var entity = await AreaRepository.FindAsync(e => e.WarehouseId == input.WarehouseId && e.Code == input.Code);
            if (entity == null)
            {
                throw new UserFriendlyException("无效的库区编码");
            }

            return ObjectMapper.Map<Area, AreaDto>(entity);
        }

        [AreaResource]
        public async Task CreateAsync(CreateInput input)
        {
            var area = new Area(GuidGenerator.Create(), input.Code, input.WarehouseId, CurrentTenant.Id.Value);
            area.AllowSpecifications = input.AllowSpecifications;
            area.ForbidSpecifications = input.ForbidSpecifications;
            area.IsActive = input.IsActive;

            await AreaManager.Create(area);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var area = await AreaRepository.FindAsync(id);
            if (area == null)
            {
                throw new EntityNotFoundException();
            }

            area.AllowSpecifications = input.AllowSpecifications;
            area.ForbidSpecifications = input.ForbidSpecifications;
            area.IsActive = input.IsActive;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await AreaManager.Delete(id);
        }
    }
}
