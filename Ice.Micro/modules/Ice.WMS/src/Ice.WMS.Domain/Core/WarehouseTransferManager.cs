using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Core.WarehouseTransfers;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.WMS.Core
{
    public class WarehouseTransferManager : IDomainService
    {
        public IRepository<WarehouseTransfer, Guid> WarehouseTransferRepository { get; }

        public IRepository<InboundOrder, Guid> InboundOrderRepository { get; }

        public IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        public WarehouseTransferManager(
            IRepository<WarehouseTransfer, Guid> warehouseTransferRepository,
            IRepository<InboundOrder, Guid> inboundOrderRepository,
            IRepository<OutboundOrder, Guid> outboundOrderRepository)
        {
            WarehouseTransferRepository = warehouseTransferRepository;
            InboundOrderRepository = inboundOrderRepository;
            OutboundOrderRepository = outboundOrderRepository;
        }

        public async Task CreateAsync(WarehouseTransfer warehouseTransfer)
        {
            if (await WarehouseTransferRepository.AnyAsync(e => e.TransferNumber == warehouseTransfer.TransferNumber))
            {
                throw new UserFriendlyException(message: $"调拨任务创建失败，调拨单号: {warehouseTransfer.TransferNumber} 已存在");
            }

            await WarehouseTransferRepository.InsertAsync(warehouseTransfer);
        }
    }
}
