using Localization.Resources.AbpUi;
using Ice.Auth.Localization;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Microsoft.Extensions.DependencyInjection;
using Ice.Auth.EntityFrameworkCore;
using Ice.Auth.Core;
using Microsoft.AspNetCore.Identity;
using System;
using Ice.Auth.IdentityServers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Ice.Utils;
using System.Threading.Tasks;
using Quartz;
using Ice.Auth.BackgroundServices.WxPays;
using Volo.Abp.BackgroundJobs.Quartz;

namespace Ice.Auth;

[DependsOn(
    typeof(AuthApplicationModule),
    typeof(AuthEntityFrameworkCoreModule),
    typeof(AbpBackgroundJobsQuartzModule),
    typeof(AbpAspNetCoreMvcModule))]
public class AuthHttpApiModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<IMvcBuilder>(mvcBuilder =>
        {
            mvcBuilder.AddApplicationPartIfNotExists(typeof(AuthHttpApiModule).Assembly);
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddQuartz(q =>
        {
            q.SchedulerId = "PayScheduler";
            q.SchedulerName = "PayScheduler";

            q.ScheduleJob<PayJob>(
                trigger => trigger
                        .WithIdentity("PayTrigger")
                        .ForJob("PayJob")
                        // 启动后立即执行一次任务
                        .StartNow()
                        .WithSimpleSchedule(x =>
                            // 每隔30分钟触发一次
                            x.WithIntervalInSeconds(1800)
                            // 指定触发器将无限重复下去
                            .RepeatForever()
                        ),
                job => job.WithIdentity("PayJob")
            );
        });

        context.Services.AddQuartz(q =>
        {
            q.SchedulerId = "WxPayCertificateScheduler";
            q.SchedulerName = "WxPayCertificateScheduler";

            q.ScheduleJob<WxPayCertificateJob>(
                trigger => trigger
                        .WithIdentity("WxPayCertificateTrigger")
                        .ForJob("WxPayCertificateJob")
                        // 启动后立即执行一次任务
                        .StartNow()
                        .WithSimpleSchedule(x =>
                            // 每隔6个小时触发一次
                            x.WithIntervalInSeconds(21600)
                            // 指定触发器将无限重复下去
                            .RepeatForever()
                        ),
                job => job.WithIdentity("WxPayCertificateJob")
            );
        });

        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Get<AuthResource>()
                .AddBaseTypes(typeof(AbpUiResource));
        });

        // 设置 Identity 使用的上下文
        context.Services
            .AddIdentityCore<User>(options => { })
            .AddEntityFrameworkStores<AuthDbContext>()
            .AddTokenProvider<DataProtectorTokenProvider<User>>(TokenOptions.DefaultProvider); ;

        // 定义 Identity 的规则设置
        context.Services.Configure<IdentityOptions>(options =>
        {
            // 密码规则
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 6;
            options.Password.RequiredUniqueChars = 1;
            // 锁定设置，多次登录失败后用户会被锁定
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
            // 用户设置
            options.User.AllowedUserNameCharacters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
            options.User.RequireUniqueEmail = false;
        });

        // IdentityService 的配置，不了解需要去查看其文档
        context.Services.AddIdentityServer()
            // 临时密钥
            .AddDeveloperSigningCredential()
            // 添加身份资源
            .AddInMemoryIdentityResources(Config.GetIdentityResources())
            // 添加Api资源
            .AddInMemoryApiScopes(Config.GetApis())
            .AddInMemoryApiResources(Config.GetApiResources())
            // 添加客户端
            .AddInMemoryClients(Config.GetClients());

        // 添加 IdentityService Token 的认证
        context.Services.AddAuthentication(x =>
            {
                x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                // jwt 验证地址，即 IdentityServer 的地址
                options.Authority = WebConfiguration.ServerUrl;
                options.RequireHttpsMetadata = false;
                // 必须的 aud 值
                options.Audience = IceResourceScopes.IceResource;

                // signalr 必须的
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.HttpContext.Request.Path.StartsWithSegments("/signalr-hubs"))
                        {
                            var accessToken = context.Request.Query["access_token"];

                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken))
                            {
                                context.Token = accessToken;
                            }
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        context.Services.AddAuthorization(options =>
        {
            options.AddPolicy(IceResourceScopes.AIScope, policy =>
            {
                policy.Requirements.Add(new ScopeRequirement(IceResourceScopes.AIScope));
            });

            options.AddPolicy(IceResourceScopes.PSIScope, policy =>
            {
                policy.Requirements.Add(new ScopeRequirement(IceResourceScopes.PSIScope));
            });

            options.AddPolicy(IceResourceScopes.WMSScope, policy =>
            {
                policy.Requirements.Add(new ScopeRequirement(IceResourceScopes.WMSScope));
            });

            options.AddPolicy(IceResourceScopes.BaseScope, policy =>
            {
                policy.Requirements.Add(new ScopeRequirement(IceResourceScopes.BaseScope));
            });
        });

        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(AuthApplicationModule).Assembly, options =>
            {
                options.RootPath = "auth";
            });
        });
    }
}
