using System;
using System.Threading.Tasks;
using Ice.PSI.Invoicings;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Uow;

namespace Ice.PSI.BackgroundServices;

public class InvoicingJob : IJob, ITransientDependency
{
    protected IServiceProvider Provider { get; }
    protected ILogger<InvoicingJob> _logger { get; }

    public InvoicingJob(
        IServiceProvider provider,
        ILogger<InvoicingJob> logger)
    {
        this.Provider = provider;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        IUnitOfWorkManager unitOfWork = Provider.GetRequiredService<IUnitOfWorkManager>();
        using (var uow = unitOfWork.Begin(requiresNew: true, isTransactional: false))
        {
            InvoicingTask service = Provider.GetRequiredService<InvoicingTask>();
            await service.Handle();
        }
    }
}