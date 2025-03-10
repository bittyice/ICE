using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.PSI.Core.PurchaseOrders
{
    public class PurchaseOrderManager : IDomainService
    {
        protected IRepository<PurchaseOrder, Guid> PurchaseOrderRepository { get; }

        public PurchaseOrderManager(
            IRepository<PurchaseOrder, Guid> purchaseOrderRepository) {
            PurchaseOrderRepository = purchaseOrderRepository;
        }

        public async Task CreateAsync(PurchaseOrder purchaseOrder) {
            if (await PurchaseOrderRepository.AnyAsync(e => e.OrderNumber == purchaseOrder.OrderNumber)) {
                throw new UserFriendlyException(message: "采购单号已存在");
            }

            await PurchaseOrderRepository.InsertAsync(purchaseOrder);
        }

        public async Task DeleteAsync(Guid id) {
            var purchaseOrder = await PurchaseOrderRepository.FindAsync(id);
            if (purchaseOrder.Status != PurchaseOrderStatus.Invalid) { 
                throw new UserFriendlyException(message: "请先作废采购单");
            }

            await PurchaseOrderRepository.DeleteAsync(purchaseOrder);
        }
    }
}
