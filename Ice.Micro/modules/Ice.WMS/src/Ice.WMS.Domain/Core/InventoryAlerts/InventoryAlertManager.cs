using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.WMS.Core.InventoryAlerts
{
    public class InventoryAlertManager : IDomainService
    {
        protected IRepository<InventoryAlert, Guid> InventoryAlertRepository { get; }


        public InventoryAlertManager(
            IRepository<InventoryAlert, Guid> inventoryAlertRepository) 
        {
            InventoryAlertRepository = inventoryAlertRepository;
        }

        public async Task CreateAsync(InventoryAlert inventoryAlert) {
            if (await InventoryAlertRepository.AnyAsync(e => e.WarehouseId == inventoryAlert.WarehouseId && e.Sku == inventoryAlert.Sku)) {
                throw new UserFriendlyException(message: "该SKU预警已存在，无法重复建立预警");
            }

            await InventoryAlertRepository.InsertAsync(inventoryAlert);
        }
    }
}
