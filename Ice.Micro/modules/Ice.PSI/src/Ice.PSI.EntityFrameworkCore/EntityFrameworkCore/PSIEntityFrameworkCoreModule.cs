using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace Ice.PSI.EntityFrameworkCore;

[DependsOn(
    typeof(PSIDomainModule),
    typeof(AbpEntityFrameworkCoreModule)
)]
public class PSIEntityFrameworkCoreModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddAbpDbContext<PSIDbContext>(options =>
        {
            /* Add custom repositories here. Example:
             * options.AddRepository<Question, EfCoreQuestionRepository>();
             */
            options.AddDefaultRepositories();
            options.AddDefaultRepository<PurchaseDetail>();
            options.AddDefaultRepository<PurchaseReturnDetail>();
            options.AddDefaultRepository<SaleReturnDetail>();
            options.AddDefaultRepository<SaleDetail>();
        });
    }
}
