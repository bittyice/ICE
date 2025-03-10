using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.PSI.Core.PurchaseReturnOrders
{
    public class PurchaseReturnOrderManager : IDomainService
    {
        protected IRepository<PurchaseReturnOrder, Guid> PurchaseReturnOrderRepository { get; }

        public PurchaseReturnOrderManager(
            IRepository<PurchaseReturnOrder, Guid> purchaseReturnOrderRepository)
        {
            PurchaseReturnOrderRepository = purchaseReturnOrderRepository;
        }

        public async Task CreateAsync(PurchaseReturnOrder purchaseReturnOrder)
        {
            if (await PurchaseReturnOrderRepository.AnyAsync(e => e.OrderNumber == purchaseReturnOrder.OrderNumber))
            {
                throw new UserFriendlyException(message: "退货单号已存在");
            }

            await PurchaseReturnOrderRepository.InsertAsync(purchaseReturnOrder);
        }

        public async Task DeleteAsync(Guid id)
        {
            var purchaseReturnOrder = await PurchaseReturnOrderRepository.FindAsync(id);
            if (purchaseReturnOrder.Status != PurchaseReturnOrderStatus.Invalid)
            {
                throw new UserFriendlyException(message: "请先作废退货单");
            }

            await PurchaseReturnOrderRepository.DeleteAsync(purchaseReturnOrder);
        }
    }
}
