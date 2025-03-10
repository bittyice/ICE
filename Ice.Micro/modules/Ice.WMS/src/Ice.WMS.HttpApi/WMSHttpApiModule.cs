using Localization.Resources.AbpUi;
using Ice.WMS.Localization;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Ice.WMS.BackgroundServices.InventoryAlerts;
using System;
using Volo.Abp.BackgroundJobs.Quartz;
using Ice.WMS.EntityFrameworkCore;
using Ice.WMS.BackgroundServices.AmountDeducts;

namespace Ice.WMS;

[DependsOn(
    typeof(WMSApplicationModule),
    typeof(WMSEntityFrameworkCoreModule),
    typeof(AbpBackgroundJobsQuartzModule),
    typeof(AbpAspNetCoreMvcModule))]
public class WMSHttpApiModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<IMvcBuilder>(mvcBuilder =>
        {
            mvcBuilder.AddApplicationPartIfNotExists(typeof(WMSHttpApiModule).Assembly);
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddQuartz(q =>
        {
            q.SchedulerId = "InventoryAlertScheduler";
            q.SchedulerName = "InventoryAlertScheduler";

            context.Services.AddQuartz(q =>
            {
                q.SchedulerId = "AmountDeductScheduler";
                q.SchedulerName = "AmountDeductScheduler";

                q.ScheduleJob<AmountDeductJob>(
                    trigger => trigger
                            .WithIdentity("AmountDeductTrigger")
                            .ForJob("AmountDeductJob")
                            // 每天凌晨4点触发
                            .WithCronSchedule("0 15 3 * * ?", cron => { cron.InTimeZone(TimeZoneInfo.Local); }),
                            //.WithSimpleSchedule(x =>
                            //    // 每隔20秒触发一次
                            //    x.WithIntervalInSeconds(180)
                            //    // 指定触发器将无限重复下去
                            //    .RepeatForever()
                            //),
                    job => job.WithIdentity("AmountDeductJob")
                );
            });

            q.ScheduleJob<InventoryAlertJob>(
                trigger => trigger
                        .WithIdentity("InventoryAlertTrigger")
                        .ForJob("InventoryAlertJob")
                        // 每天凌晨3点触发
                        .WithCronSchedule("0 0 3 * * ?", cron => { cron.InTimeZone(TimeZoneInfo.Local); })
                        // 启动后立即执行一次任务
                        // .StartNow()
                        //.WithSimpleSchedule(x =>
                        //    // 每隔20秒触发一次
                        //    x.WithIntervalInSeconds(60)
                        //    // 指定触发器将无限重复下去
                        //    .RepeatForever()
                        //)
                , job => job.WithIdentity("InventoryAlertJob")
            );
        });

        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(WMSApplicationModule).Assembly, options =>
            {
                options.RootPath = "wms";
            });
        });

        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Get<WMSResource>()
                .AddBaseTypes(typeof(AbpUiResource));
        });
    }
}
