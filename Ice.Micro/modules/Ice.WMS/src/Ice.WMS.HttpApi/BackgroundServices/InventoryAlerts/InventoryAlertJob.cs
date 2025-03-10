using Ice.WMS.InventoryAlertHandles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Uow;

namespace Ice.WMS.BackgroundServices.InventoryAlerts
{
    public class InventoryAlertJob : IJob, ITransientDependency
    {
        protected IServiceProvider Provider { get; }
        private readonly ILogger<InventoryAlertJob> _logger;

        public InventoryAlertJob(
            IServiceProvider provider, 
            ILogger<InventoryAlertJob> logger,
            InventoryAlertHandleAppService service)
        {
            this.Provider = provider;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            IUnitOfWorkManager unitOfWork = Provider.GetRequiredService<IUnitOfWorkManager>();
            using (var uow = unitOfWork.Begin(requiresNew: true, isTransactional: false))
            {
                InventoryAlertHandleAppService service = Provider.GetRequiredService<InventoryAlertHandleAppService>();
                await service.CheckInventory();
            }
        }
    }
}
