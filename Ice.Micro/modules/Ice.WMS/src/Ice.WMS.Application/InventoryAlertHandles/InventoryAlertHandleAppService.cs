using Ice.WMS.Core;
using Ice.WMS.Core.InventoryAlerts;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Uow;

namespace Ice.WMS.InventoryAlertHandles
{
    [RemoteService(IsEnabled = false)]
    public class InventoryAlertHandleAppService : WMSAppService
    {
        protected InventoryAlertHandleService InventoryAlertHandleService { get; }

        protected IRepository<InventoryAlert, Guid> InventoryAlertRepository { get; }

        protected IUnitOfWorkManager UnitOfWorkManager { get; }

        protected IDataFilter DataFilter { get; }

        public InventoryAlertHandleAppService(
            InventoryAlertHandleService inventoryAlertHandleService,
            IRepository<InventoryAlert, Guid> inventoryAlertRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IDataFilter dataFilter) 
        {
            InventoryAlertHandleService = inventoryAlertHandleService;
            InventoryAlertRepository = inventoryAlertRepository;
            UnitOfWorkManager = unitOfWorkManager;
            DataFilter = dataFilter;
        }

        public async Task CheckInventory() 
        {
            // 禁用租户数据过滤
            using (DataFilter.Disable<IMultiTenant>())
            {
                // 查询数据
                var queryable = (await InventoryAlertRepository.GetQueryableAsync()).Where(e => e.IsActive);

                int page = 0;
                int pageSize = 10;

                while (true)
                {
                    var inventoryAlerts = queryable.Skip(pageSize * page).Take(pageSize).ToList();

                    using (var uow = UnitOfWorkManager.Begin(requiresNew: true, isTransactional: true))
                    {
                        try {
                            foreach (var alert in inventoryAlerts)
                            {
                                await InventoryAlertHandleService.CheckAndHandleInventoryAlterAsync(alert);
                            }

                            await uow.CompleteAsync();
                        }
                        catch(Exception ex) {
                            Logger.LogError($"发送库存预警失败，ids: {inventoryAlerts.Select(e => e.Id.ToString())}", ex);
                        }
                    }

                    if (inventoryAlerts.Count < pageSize)
                    {
                        break;
                    }

                    page++;
                }
            }
        }
    }
}
