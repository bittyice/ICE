using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.WMS.Core.LossReportOrders
{
    public class LossReportOrderManager : IDomainService
    {
        protected IRepository<LossReportOrder, Guid> LossReportOrderRepository { get; }

        public LossReportOrderManager(
            IRepository<LossReportOrder, Guid> lossReportOrderRepository)
        {
            LossReportOrderRepository = lossReportOrderRepository;
        }

        public async Task CreateAsync(LossReportOrder lossReportOrder) {
            if (await LossReportOrderRepository.AnyAsync(e => e.OrderNumber == lossReportOrder.OrderNumber))
            {
                throw new UserFriendlyException(message: "报损单号已存在");
            }

            await LossReportOrderRepository.InsertAsync(lossReportOrder);
        }

        public async Task DeleteAsync(LossReportOrder lossReportOrder)
        {
            if (lossReportOrder.Status != LossReportOrderStatus.Invalid)
            {
                throw new UserFriendlyException(message: "请先作废报损单，才能删除");
            }

            await LossReportOrderRepository.DeleteAsync(lossReportOrder);
        }
    }
}
