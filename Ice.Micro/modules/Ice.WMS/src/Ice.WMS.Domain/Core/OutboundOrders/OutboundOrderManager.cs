using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using System.Linq;
using Volo.Abp.Domain.Entities;

namespace Ice.WMS.Core.OutboundOrders
{
    public class OutboundOrderManager : IDomainService
    {
        protected IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        public OutboundOrderManager(IRepository<OutboundOrder, Guid> outboundOrderRepository)
        {
            OutboundOrderRepository = outboundOrderRepository;
        }

        public async Task CreateAsync(OutboundOrder outboundOrder) {
            if (await OutboundOrderRepository.AnyAsync(e => e.OutboundNumber == outboundOrder.OutboundNumber)) {
                throw new UserFriendlyException(message: "出库单号已存在", WMSErrorCodes.OutboundNumberRepeat);
            }

            await OutboundOrderRepository.InsertAsync(outboundOrder);
        }

        public async Task DeleteAsync(OutboundOrder outboundOrder) {
            if (outboundOrder.Status != OutboundOrderStatus.Invalid) {
                throw new UserFriendlyException(message: "需要先作废订单才能删除");
            }

            await OutboundOrderRepository.DeleteAsync(outboundOrder);
        }
    }
}
