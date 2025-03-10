using Localization.Resources.AbpUi;
using Ice.PSI.Localization;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Microsoft.Extensions.DependencyInjection;
using Ice.PSI.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.Quartz;
using Quartz;
using Ice.PSI.BackgroundServices;
using System;

namespace Ice.PSI;

[DependsOn(
    typeof(PSIApplicationModule),
    typeof(PSIEntityFrameworkCoreModule),
    typeof(AbpBackgroundJobsQuartzModule),
    typeof(AbpAspNetCoreMvcModule))]
public class PSIHttpApiModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<IMvcBuilder>(mvcBuilder =>
        {
            mvcBuilder.AddApplicationPartIfNotExists(typeof(PSIHttpApiModule).Assembly);
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddQuartz(q =>
        {
            q.SchedulerId = "InvoicingScheduler";
            q.SchedulerName = "InvoicingScheduler";

            q.ScheduleJob<InvoicingJob>(
                trigger => trigger
                        .WithIdentity("InvoicingTrigger")
                        .ForJob("InvoicingJob")
                        // 每月1号凌晨触发
                        .WithCronSchedule("0 0 0 1 * ?", cron => { cron.InTimeZone(TimeZoneInfo.Local); })
                        // .WithCronSchedule("0 11 17 10 * ?", cron => { cron.InTimeZone(TimeZoneInfo.Local); })
                , job => job.WithIdentity("InvoicingJob")
            );
        });
        
        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Get<PSIResource>()
                .AddBaseTypes(typeof(AbpUiResource));
        });

        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(PSIApplicationModule).Assembly, options =>
            {
                options.RootPath = "psi";
            });
        });
    }
}
