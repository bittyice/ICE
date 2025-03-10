using Ice.WMS.InventoryAlertHandles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Uow;

namespace Ice.WMS.BackgroundServices.AmountDeducts
{
    public class AmountDeductJob : IJob, ITransientDependency
    {
        protected IServiceProvider Provider { get; }
        private readonly ILogger<AmountDeductJob> _logger;

        public AmountDeductJob(
            IServiceProvider provider, 
            ILogger<AmountDeductJob> logger,
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
                AmountDeductHandle service = Provider.GetRequiredService<AmountDeductHandle>();
                await service.Handle();
            }
        }
    }
}
