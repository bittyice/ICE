using Ice.Auth.Core;
using Ice.Auth.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;

namespace Ice.Auth.Services.GuestBlacklists
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class GuestBlacklistAppService : AuthAppService
    {
        protected IRepository<GuestBlacklist, Guid> GuestBlacklistRepository { get; }

        public GuestBlacklistAppService(
            IRepository<GuestBlacklist, Guid> guestBlacklistRepository
        )
        {
            GuestBlacklistRepository = guestBlacklistRepository;
        }

        public async Task<PagedResultDto<GuestBlacklistDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(GuestBlacklist.CreationTime);

            IQueryable<GuestBlacklist> queryable = await GuestBlacklistRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Ip))
            {
                queryable = queryable.Where(e => e.Ip == input.Ip);
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
            List<GuestBlacklist> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<GuestBlacklistDto>(
                count,
                ObjectMapper.Map<List<GuestBlacklist>, List<GuestBlacklistDto>>(list)
            );
        }

        public async Task<GuestBlacklistDto> GetAsync(Guid id)
        {
            var entity = await GuestBlacklistRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<GuestBlacklist, GuestBlacklistDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            var guestBlacklist = new GuestBlacklist();
            guestBlacklist.Ip = input.Ip;

            await GuestBlacklistRepository.InsertAsync(guestBlacklist);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var guestBlacklist = await GuestBlacklistRepository.FindAsync(id);
            if (guestBlacklist == null)
            {
                throw new EntityNotFoundException();
            }

            guestBlacklist.Ip = input.Ip;
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await GuestBlacklistRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
