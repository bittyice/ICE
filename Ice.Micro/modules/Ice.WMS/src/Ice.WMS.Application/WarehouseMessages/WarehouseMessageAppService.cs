using Ice.WMS.Core.WarehouseMessages;
using Ice.WMS.Dtos;
using Ice.WMS.WarehouseMessages.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;

namespace Ice.WMS.WarehouseMessages
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class WarehouseMessageAppService : WMSAppService
    {
        public IRepository<WarehouseMessage, Guid> WarehouseMessageRepository { get; }

        public WarehouseMessageAppService(
            IRepository<WarehouseMessage, Guid> warehouseMessageRepository)
        {
            WarehouseMessageRepository = warehouseMessageRepository;
        }

        public async Task<int> GetUnreadCount(Guid warehouseId) {
            return (await WarehouseMessageRepository.GetQueryableAsync()).Where(e => e.WarehouseId == warehouseId && e.Readed == false).Count();
        }
        
        [HttpPut]
        public async Task Read(Guid id) {
            var warehouseMessage = await WarehouseMessageRepository.FindAsync(id);
            warehouseMessage.Read(CurrentUser.Id.Value);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<PagedResultDto<WarehouseMessageDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(WarehouseMessage.CreationTime)
                && sorting != nameof(WarehouseMessage.Id)
                && sorting != nameof(WarehouseMessage.Title)
                )
            {
                sorting = nameof(WarehouseMessage.CreationTime);
            }

            IQueryable<WarehouseMessage> queryable = await WarehouseMessageRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Title))
            {
                queryable = queryable.Where(e => e.Title.StartsWith(input.Title));
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            long count = queryable.Count();
            List<WarehouseMessage> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<WarehouseMessageDto>(
                count,
                ObjectMapper.Map<List<WarehouseMessage>, List<WarehouseMessageDto> >(list)
            );
        }

        public async Task<WarehouseMessageDto> GetAsync(Guid id) {
            var warehouseMessage = await WarehouseMessageRepository.FindAsync(id);
            return ObjectMapper.Map<WarehouseMessage, WarehouseMessageDto>(warehouseMessage);
        }
    }
}
