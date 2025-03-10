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

namespace Ice.AI.Services.QuestionnaireResults
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.AIScope)]
    public class QuestionnaireResultAppService : AIAppService
    {
        protected IRepository<QuestionnaireResult, Guid> QuestionnaireResultRepository { get; }

        public QuestionnaireResultAppService(
            IRepository<QuestionnaireResult, Guid> questionnaireRepository
        )
        {
            QuestionnaireResultRepository = questionnaireRepository;
        }

        public async Task<PagedResultDto<QuestionnaireResultDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(QuestionnaireResult.CreationTime);

            IQueryable<QuestionnaireResult> queryable = await QuestionnaireResultRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrEmpty(input.TagName))
            {
                queryable = queryable.Where(e => e.TagName == input.TagName);
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
            List<QuestionnaireResultDto> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount)
            .Select(e => new QuestionnaireResultDto()
            {
                Id = e.Id,
                Questions = e.Questions,
                Results = e.Results,
                Phone = e.Phone,
                GuestName = e.GuestName,
                Email = e.Email,
                CreationTime = e.CreationTime,
                TagName = e.TagName,
                Ip = e.Ip,
                Province = e.Province
            })
            .ToList();

            list.ForEach(item =>
            {
                item.CreationTime = new DateTimeOffset(item.CreationTime.DateTime);
            });

            return new PagedResultDto<QuestionnaireResultDto>(
                count,
                list
            );
        }

        public async Task<QuestionnaireResultDto> GetAsync(Guid id)
        {
            var entity = await QuestionnaireResultRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<QuestionnaireResult, QuestionnaireResultDto>(entity);
        }

        public async Task SetTagNameAsync(Guid id, SetTagNameInput input)
        {
            var entity = await QuestionnaireResultRepository.FindAsync(id);
            entity.TagName = input.TagName;
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await QuestionnaireResultRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
