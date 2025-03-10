using Localization.Resources.AbpUi;
using Ice.Base.Localization;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Microsoft.Extensions.DependencyInjection;
using Ice.Base.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.Quartz;

namespace Ice.Base;

[DependsOn(
    typeof(BaseApplicationModule),
    typeof(BaseEntityFrameworkCoreModule),
    typeof(AbpBackgroundJobsQuartzModule),
    typeof(AbpAspNetCoreMvcModule))]
public class BaseHttpApiModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<IMvcBuilder>(mvcBuilder =>
        {
            mvcBuilder.AddApplicationPartIfNotExists(typeof(BaseHttpApiModule).Assembly);
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(BaseApplicationModule).Assembly, options => {
                options.RootPath = "base";
            });
        });

        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Get<BaseResource>()
                .AddBaseTypes(typeof(AbpUiResource));
        });
    }
}
