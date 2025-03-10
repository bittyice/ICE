using Ice.Utils;
using Ice.WMS.Core.StockChangeLogs;
using Ice.WMS.Dtos;
using Ice.WMS.StockChangeLogs.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.StockChangeLogs
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class StockChangeLogAppService: WMSAppService
    {
        protected IRepository<StockChangeLog, Guid> WarehouseCheckRepository { get; }

        public StockChangeLogAppService(
            IRepository<StockChangeLog, Guid> warehouseCheckRepository)
        {
            WarehouseCheckRepository = warehouseCheckRepository;
        }

        public async Task<PagedResultDto<StockChangeLogDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(StockChangeLog.CreationTime);

            IQueryable<StockChangeLog> queryable = await WarehouseCheckRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (input.RelationId != null)
            {
                queryable = queryable.Where(e => e.RelationId == input.RelationId);
            }

            if (input.WarehouseId != null)
            {
                queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);
            }

            long count = queryable.Count();
            List<StockChangeLog> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<StockChangeLogDto>(
                count,
                ObjectMapper.Map<List<StockChangeLog>, List<StockChangeLogDto>>(list)
            );
        }

        [HttpGet]
        [ActionName("all")]
        public async Task<List<StockChangeLogDto>> GetAllAsync(GetAllInput input) { 
            var list = (await WarehouseCheckRepository.GetQueryableAsync()).Where(e => e.RelationId == input.RelationId).OrderByDescending(e => e.CreationTime).ToList();
            return ObjectMapper.Map<List<StockChangeLog>, List<StockChangeLogDto>>(list);
        }
    }
}
