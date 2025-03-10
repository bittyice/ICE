using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.PSI.Core.SaleReturnOrders
{
    public class SaleReturnManager : DomainService
    {
        protected IRepository<SaleReturnOrder, Guid> SaleReturnOrderRepository { get; }


        public SaleReturnManager(
            IRepository<SaleReturnOrder, Guid> saleReturnOrderRepository)
        {
            SaleReturnOrderRepository = saleReturnOrderRepository;
        }

        public async Task CreateAsync(SaleReturnOrder saleReturnOrder)
        {
            if (await SaleReturnOrderRepository.AnyAsync(e => e.OrderNumber == saleReturnOrder.OrderNumber))
            {
                throw new UserFriendlyException(message: "退货单号已存在");
            }

            if (!string.IsNullOrWhiteSpace(saleReturnOrder.SaleNumber) &&
                await SaleReturnOrderRepository.AnyAsync(e => e.Status != SaleReturnOrderStatus.Rejected && e.SaleNumber == saleReturnOrder.SaleNumber))
            {
                throw new UserFriendlyException(message: "该销售单已申请过退货单，请先作驳回的退货单再重新申请");
            }

            await SaleReturnOrderRepository.InsertAsync(saleReturnOrder);
        }
    }
}
