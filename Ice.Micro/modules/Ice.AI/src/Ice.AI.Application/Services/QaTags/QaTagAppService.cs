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

namespace Ice.AI.Services.QaTags
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.AIScope)]
    public class QaTagAppService : AIAppService
    {
        protected IRepository<QaTag, Guid> QaTagRepository { get; }

        public QaTagAppService(
            IRepository<QaTag, Guid> questionnaireRepository
        )
        {
            QaTagRepository = questionnaireRepository;
        }

        public async Task<PagedResultDto<QaTagDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(QaTag.Id);

            IQueryable<QaTag> queryable = await QaTagRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            long count = queryable.Count();
            List<QaTag> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<QaTagDto>(
                count,
                ObjectMapper.Map<List<QaTag>, List<QaTagDto>>(list)
            );
        }

        public async Task<QaTagDto> GetAsync(Guid id)
        {
            var entity = await QaTagRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<QaTag, QaTagDto>(entity);
        }

        [QaTagsResource]
        public async Task CreateAsync(CreateInput input)
        {
            var entity = new QaTag()
            {
                Name = input.Name
            };

            await QaTagRepository.InsertAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var entity = await QaTagRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.Name = input.Name;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await QaTagRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
