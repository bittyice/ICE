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
using Ice.AI.Core;
using Ice.AI.Dtos;
using Ice.AI.Filters.MaxResources;

namespace Ice.AI.Services.CsTexts
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.AIScope)]
    public class CsTextAppService : AIAppService
    {
        protected IRepository<CsText, Guid> CsTextRepository { get; }

        public CsTextAppService(
            IRepository<CsText, Guid> csTextRepository
        )
        {
            CsTextRepository = csTextRepository;
        }

        public async Task<PagedResultDto<CsTextDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(CsText.Id);

            IQueryable<CsText> queryable = await CsTextRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            long count = queryable.Count();
            List<CsText> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<CsTextDto>(
                count,
                ObjectMapper.Map<List<CsText>, List<CsTextDto>>(list)
            );
        }

        public async Task<CsTextDto> GetAsync(Guid id)
        {
            var entity = await CsTextRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<CsText, CsTextDto>(entity);
        }

        [CsTextsResource]
        public async Task CreateAsync(CreateInput input)
        {
            var entity = new CsText()
            {
                GroupName = input.GroupName,
                TextList = input.TextList
            };

            await CsTextRepository.InsertAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var entity = await CsTextRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.GroupName = input.GroupName;
            entity.TextList = input.TextList;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await CsTextRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
