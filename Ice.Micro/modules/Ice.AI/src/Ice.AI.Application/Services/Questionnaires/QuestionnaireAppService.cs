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

namespace Ice.AI.Services.Questionnaires
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.AIScope)]
    public class QuestionnaireAppService : AIAppService
    {
        protected IRepository<Questionnaire, Guid> QuestionnaireRepository { get; }

        public QuestionnaireAppService(
            IRepository<Questionnaire, Guid> questionnaireRepository
        )
        {
            QuestionnaireRepository = questionnaireRepository;
        }

        public async Task<PagedResultDto<QuestionnaireDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(Questionnaire.Id);

            IQueryable<Questionnaire> queryable = await QuestionnaireRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            long count = queryable.Count();
            List<Questionnaire> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<QuestionnaireDto>(
                count,
                ObjectMapper.Map<List<Questionnaire>, List<QuestionnaireDto>>(list)
            );
        }

        public async Task<QuestionnaireDto> GetAsync(Guid id)
        {
            var entity = await QuestionnaireRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Questionnaire, QuestionnaireDto>(entity);
        }

        [QuestionnairesResource]
        public async Task CreateAsync(CreateInput input)
        {
            var entity = new Questionnaire()
            {
                Question = input.Question
            };

            await QuestionnaireRepository.InsertAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var entity = await QuestionnaireRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.Question = input.Question;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await QuestionnaireRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
