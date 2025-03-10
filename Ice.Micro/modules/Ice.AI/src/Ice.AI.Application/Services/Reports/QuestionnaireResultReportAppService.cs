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
    public class QuestionnaireResultReportAppService : AIAppService
    {
        protected IRepository<QuestionnaireResult, Guid> QuestionnaireResultRepository { get; }

        public QuestionnaireResultReportAppService(
            IRepository<QuestionnaireResult, Guid> questionnaireResultRepository
        )
        {
            QuestionnaireResultRepository = questionnaireResultRepository;
        }

        // 通过省份统计
        public async Task<List<GetQuantityOutputItem>> GetQuantityOfProvince(GetQuantityInput input)
        {
            var queryable = await QuestionnaireResultRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.LocalDateTime && e.CreationTime < input.CreationTimeMax.LocalDateTime);
            return queryable.GroupBy(e => e.Province).Select(item => new GetQuantityOutputItem()
            {
                Key = item.Key,
                Quantity = item.Count()
            }).ToList();
        }

        // 通过标签统计
        public async Task<List<GetQuantityOutputItem>> GetQuantityOfTagName(GetQuantityInput input)
        {
            var queryable = await QuestionnaireResultRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.LocalDateTime && e.CreationTime < input.CreationTimeMax.LocalDateTime);
            return queryable.GroupBy(e => e.TagName).Select(item => new GetQuantityOutputItem()
            {
                Key = item.Key,
                Quantity = item.Count()
            }).ToList();
        }

        // 获取用户关注的内容
        public async Task<List<GetQuantityOutputItem>> GetQuantityOfFocusQuestion(GetQuantityInput input)
        {
            var queryable = await QuestionnaireResultRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.LocalDateTime && e.CreationTime < input.CreationTimeMax.LocalDateTime);
            var focusQuestions = queryable.Select(e => e.FocusQuestion).ToList();
            Dictionary<string, int> focusQuestionDic = new Dictionary<string, int>();
            foreach (var focusQuestion in focusQuestions)
            {
                if (string.IsNullOrEmpty(focusQuestion))
                {
                    continue;
                }
                var arr = focusQuestion.Split('\n');
                foreach (var item in arr)
                {
                    focusQuestionDic.TryGetValue(item, out int quantity);
                    focusQuestionDic[item] = quantity + 1;
                }
            }

            List<GetQuantityOutputItem> result = new List<GetQuantityOutputItem>();
            foreach (var item in focusQuestionDic)
            {
                result.Add(new GetQuantityOutputItem()
                {
                    Key = item.Key,
                    Quantity = item.Value
                });
            }

            result.Sort((l, r) => r.Quantity - l.Quantity);

            return result;
        }
    }

    public class GetQuantityInput
    {
        public DateTimeOffset CreationTimeMin { get; set; }

        public DateTimeOffset CreationTimeMax { get; set; }
    }

    public class GetQuantityOutput
    {

    }

    public class GetQuantityOutputItem
    {
        public string? Key { get; set; }

        public int Quantity { get; set; }
    }
}
