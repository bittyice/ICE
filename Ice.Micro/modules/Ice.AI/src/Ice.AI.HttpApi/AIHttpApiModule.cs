using Localization.Resources.AbpUi;
using Ice.AI.Localization;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.AspNetCore.SignalR;
using Ice.AI.SemanticKernel;
using Ice.AI.EntityFrameworkCore;

namespace Ice.AI;

[DependsOn(
    typeof(AIApplicationModule),
    typeof(AIEntityFrameworkCoreModule),
    typeof(AbpAspNetCoreSignalRModule),
    typeof(AbpAspNetCoreMvcModule))]
public class AIHttpApiModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<IMvcBuilder>(mvcBuilder =>
        {
            mvcBuilder.AddApplicationPartIfNotExists(typeof(AIHttpApiModule).Assembly);
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Get<AIResource>()
                .AddBaseTypes(typeof(AbpUiResource));
        });

        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(AIApplicationModule).Assembly, options =>
            {
                options.RootPath = "ai";
            });
        });

        context.Services.AddSemanticKernel();
    }
}
