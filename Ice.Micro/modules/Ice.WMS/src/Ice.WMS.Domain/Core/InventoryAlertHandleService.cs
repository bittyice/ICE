using Ice.WMS.Core.InventoryAlerts;
using Ice.WMS.Core.Locations;
using Ice.WMS.Core.WarehouseMessages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;

namespace Ice.WMS.Core
{
    public class InventoryAlertHandleService : IDomainService
    {
        protected IRepository<InventoryAlert, Guid> InventoryAlertRepository { get; }

        protected IRepository<LocationDetail, Guid> LocationDetailRepository { get; }

        protected IRepository<WarehouseMessage, Guid> WarehouseMessageRepository { get; }

        protected IGuidGenerator GuidGenerator { get; }

        public InventoryAlertHandleService(
            IRepository<InventoryAlert, Guid> inventoryAlertRepository,
            IRepository<LocationDetail, Guid> locationDetailRepository,
            IRepository<WarehouseMessage, Guid> warehouseMessageRepository,
            IGuidGenerator guidGenerator) 
        {
            InventoryAlertRepository = inventoryAlertRepository;
            LocationDetailRepository = locationDetailRepository;
            WarehouseMessageRepository = warehouseMessageRepository;
            GuidGenerator = guidGenerator;
        }

        public async Task CheckAndHandleInventoryAlterAsync(InventoryAlert inventoryAlert)
        {
            var total =(await LocationDetailRepository.GetQueryableAsync())
                .Where(e =>
                    e.TenantId == inventoryAlert.TenantId &&
                    e.Location.WarehouseId == inventoryAlert.WarehouseId &&
                    e.Sku == inventoryAlert.Sku)
                .Sum(e => e.Quantity);

            if (total <= inventoryAlert.Quantity) {
                await WarehouseMessageRepository.InsertAsync(new WarehouseMessage(
                    GuidGenerator.Create(),
                    $"库存预警 - {inventoryAlert.Sku}",
                    $"{inventoryAlert.Sku}的库存{total}低于设置的预警值{inventoryAlert.Quantity}，请及时补充库存",
                    inventoryAlert.WarehouseId,
                    inventoryAlert.TenantId));
            }
        }
    }
}
