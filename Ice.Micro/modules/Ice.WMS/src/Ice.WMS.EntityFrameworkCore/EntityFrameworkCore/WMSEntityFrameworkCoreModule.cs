using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.Locations;
using Ice.WMS.Core.LossReportOrders;
using Ice.WMS.Core.OutboundOrders;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace Ice.WMS.EntityFrameworkCore;

[DependsOn(
    typeof(WMSDomainModule),
    typeof(AbpEntityFrameworkCoreModule)
)]
public class WMSEntityFrameworkCoreModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddAbpDbContext<WMSDbContext>(options =>
        {
            /* Add custom repositories here. Example:
             * options.AddRepository<Question, EfCoreQuestionRepository>();
             */
            options.AddDefaultRepositories();//
            options.AddDefaultRepository<LocationDetail>();
            options.AddDefaultRepository<OutboundDetail>();
            options.AddDefaultRepository<InboundDetail>();
            options.AddDefaultRepository<LossReportDetail>();
        });
    }
}
