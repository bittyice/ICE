using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using System.Linq;

namespace Ice.WMS.Core.InboundOrders
{
    public class InboundOrderManager : IDomainService
    {
        protected IRepository<InboundOrder, Guid> InboundOrderRepository { get; set; }

        public InboundOrderManager(IRepository<InboundOrder, Guid> inboundOrderRepository) 
        {
            InboundOrderRepository = inboundOrderRepository;
        }

        public async Task CreateAsync(InboundOrder inboundOrder) {
            if (await InboundOrderRepository.AnyAsync(e => e.InboundNumber == inboundOrder.InboundNumber)) {
                throw new UserFriendlyException(message: "入库单号已存在", WMSErrorCodes.InboundNumberRepeat);
            }

            await InboundOrderRepository.InsertAsync(inboundOrder);
        }

        public async Task DeleteAsync(InboundOrder inboundOrder) {
            if (inboundOrder.Status != InboundOrderStatus.Invalid) {
                throw new UserFriendlyException(message: "请先作废入库单，才能删除");
            }

            await InboundOrderRepository.DeleteAsync(inboundOrder);
        }
    }
}
