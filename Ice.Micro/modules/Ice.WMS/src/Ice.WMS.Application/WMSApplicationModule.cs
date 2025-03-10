using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.AutoMapper;
using Volo.Abp.Modularity;
using Volo.Abp.Application;
using Volo.Abp.Caching;

namespace Ice.WMS;

[DependsOn(
    typeof(WMSDomainModule),
    typeof(WMSApplicationContractsModule),
    typeof(AbpDddApplicationModule),
    typeof(AbpCachingModule),
    typeof(AbpAutoMapperModule),
    typeof(IceCommonModule)
    )]
public class WMSApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddAutoMapperObjectMapper<WMSApplicationModule>();
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<WMSApplicationModule>(validate: true);
        });

        var configuration = context.Services.GetConfiguration();
        WebConfiguration.Init(configuration);
    }
}
