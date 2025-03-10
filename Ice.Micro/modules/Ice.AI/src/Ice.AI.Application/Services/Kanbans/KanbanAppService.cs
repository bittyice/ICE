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
using Microsoft.AspNetCore.Mvc;

namespace Ice.AI.Services.Kanbans
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.AIScope)]
    public class KanbanAppService : AIAppService
    {
        protected IRepository<Client, Guid> ClientRepository { get; }

        protected IRepository<QuestionnaireResult, Guid> QuestionnaireResultRepository { get; }

        public KanbanAppService(
            IRepository<Client, Guid> clientRepository,
            IRepository<QuestionnaireResult, Guid> questionnaireResultRepository
        )
        {
            ClientRepository = clientRepository;
            QuestionnaireResultRepository = questionnaireResultRepository;
        }

        [HttpGet]
        public async Task<ClientStatisticsOutput> ClientStatistics()
        {
            DateTime now = DateTime.Now;
            DateTime toDay = new DateTime(now.Year, now.Month, now.Day);

            var query = await ClientRepository.GetQueryableAsync();
            int totalQuantity = query.Count();
            int toDayQuantity = query.Count(e => e.CreationTime > toDay);
            var list = query.GroupBy(e => e.Intention).Select(group => new ClientStatisticsQueryGroup()
            {
                Intention = group.Key,
                Quantity = group.Count()
            }).ToList();

            return new ClientStatisticsOutput() {
                ToDayQuantity = toDayQuantity,
                TotalQuantity = totalQuantity,
                IntentionQuantity = list
            };
        }

        [HttpGet]
        public async Task<QuestionnaireResultStatisticsOutput> QuestionnaireResultStatistics()
        {
            DateTime now = DateTime.Now;
            DateTime toDay = new DateTime(now.Year, now.Month, now.Day);

            var query = await QuestionnaireResultRepository.GetQueryableAsync();
            int totalQuantity = query.Count();
            int toDayQuantity = query.Count(e => e.CreationTime > toDay);

            return new QuestionnaireResultStatisticsOutput() {
                ToDayQuantity = toDayQuantity,
                TotalQuantity = totalQuantity,
            };
        }
    }

    public class ClientStatisticsOutput
    {
        public int ToDayQuantity { get; set; }

        public int TotalQuantity { get; set; }

        public List<ClientStatisticsQueryGroup> IntentionQuantity { get; set; }
    }

    public class ClientStatisticsQueryGroup
    {
        public string? Intention { get; set; }

        public int Quantity { get; set; }
    }

    public class QuestionnaireResultStatisticsOutput
    {
        public int ToDayQuantity { get; set; }

        public int TotalQuantity { get; set; }
    }
}
