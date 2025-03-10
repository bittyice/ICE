using Volo.Abp.Modularity;

namespace Ice.WMS;

[DependsOn(
    typeof(WMSApplicationModule),
    typeof(WMSDomainTestModule)
    )]
public class WMSApplicationTestModule : AbpModule
{

}
