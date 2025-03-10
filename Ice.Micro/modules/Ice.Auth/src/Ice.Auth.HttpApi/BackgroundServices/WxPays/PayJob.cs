using Ice.Auth.Services.Pays;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using System;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Uow;

namespace Ice.Auth.BackgroundServices.WxPays
{
    public class PayJob : IJob, ITransientDependency
    {
        protected IServiceProvider Provider { get; }

        public PayJob(
            IServiceProvider provider)
        {
            this.Provider = provider;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            IUnitOfWorkManager unitOfWork = Provider.GetRequiredService<IUnitOfWorkManager>();
            using (var uow = unitOfWork.Begin(requiresNew: true, isTransactional: false))
            {
                WxPayHandler service = Provider.GetRequiredService<WxPayHandler>();
                await service.Handle();
            }

            using (var uow = unitOfWork.Begin(requiresNew: true, isTransactional: false))
            {
                ZfbPayHandler service = Provider.GetRequiredService<ZfbPayHandler>();
                await service.Handle();
            }
        }
    }
}
