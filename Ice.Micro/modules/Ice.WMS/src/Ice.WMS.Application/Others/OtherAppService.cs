using Ice.Utils;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.OutboundOrders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.Others
{
    public class OtherAppService : WMSAppService
    {
        protected IRepository<InboundOrder, Guid> InboundOrderRepository { get; }

        protected IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        public OtherAppService(
            IRepository<InboundOrder, Guid> inboundOrderRepository,
            IRepository<OutboundOrder, Guid> outboundOrderRepository
        )
        {
            InboundOrderRepository = inboundOrderRepository;
            OutboundOrderRepository = outboundOrderRepository;
        }

        [HttpGet]
        [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
        public async Task<SearchOrderOutputItem> SearchOrderAsync(SearchOrderInput input)
        {
            SearchOrderOutputItem result;
            result = (await InboundOrderRepository.GetQueryableAsync()).Where(e => e.InboundNumber == input.OrderNumber).Select(e => new SearchOrderOutputItem()
            {
                OrderNumber = e.InboundNumber,
                Type = "IN"
            }).FirstOrDefault();
            
            if (result != null)
            {
                return result;
            }

            result = (await OutboundOrderRepository.GetQueryableAsync()).Where(e => e.OutboundNumber == input.OrderNumber).Select(e => new SearchOrderOutputItem()
            {
                OrderNumber = e.OutboundNumber,
                Type = "OUT"
            }).FirstOrDefault();

            if (result != null)
            {
                return result;
            }
            return null;
        }

        public int GetMinPdaVersion()
        {
            return WebConfiguration.IceConfig.MinPdaVersion;
        }
    }
}
