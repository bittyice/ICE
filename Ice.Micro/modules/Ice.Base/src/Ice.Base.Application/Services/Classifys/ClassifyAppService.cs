using Ice.Base.Core.Classifys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Ice.Base.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Ice.Utils;
using Ice.Base.Filters.MaxResources;

namespace Ice.Base.Services.Classifys
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.BaseScope)]
    public class ClassifyAppService : BaseAppService
    {
        protected IRepository<Classify, Guid> ClassifyRepository { get; }
        public ClassifyAppService(
            IRepository<Classify, Guid> classifyRepository
        )
        {
            ClassifyRepository = classifyRepository;
        }

        public async Task<PagedResultDto<ClassifyDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(Classify.Name);

            IQueryable<Classify> queryable = await ClassifyRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (input.ParentId != null)
            {
                queryable = queryable.Where(e => e.ParentId == input.ParentId);
            }
            
            long count = queryable.Count();
            List<Classify> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<ClassifyDto>(
                count,
                ObjectMapper.Map<List<Classify>, List<ClassifyDto>>(list)
            );
        }

        public async Task<ClassifyDto> GetAsync(Guid id)
        {
            var entity = await ClassifyRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Classify, ClassifyDto>(entity);
        }

        [ClassifyResource]
        public async Task CreateAsync(CreateInput input)
        {
            var classify = new Classify(GuidGenerator.Create(), input.Name, CurrentTenant.Id.Value);
            classify.ParentId = input.ParentId;

            await ClassifyRepository.InsertAsync(classify);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var classify = await ClassifyRepository.FirstOrDefaultAsync(e => e.Id == id);
            if (classify == null)
            {
                throw new EntityNotFoundException();
            }

            classify.Name = input.Name;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            if (await ClassifyRepository.AnyAsync(e => e.ParentId == id)) {
                throw new UserFriendlyException(message: "删除分类失败，请先删除子分类");
            }

            await ClassifyRepository.DeleteAsync(e => e.Id == id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
