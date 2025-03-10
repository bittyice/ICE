
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Ice.Auth.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using static Ice.Auth.Helpers.VerificationCodeHelper;

namespace Ice.Auth.Services.Accounts;

public class AccountAppService : AuthAppService
{
    protected VerificationCodeHelper VerificationCodeHelper { get; }

    protected SmsHelper SmsHelper { get; }

    protected TenantManager TenantManager { get; }

    protected UserManager<User> UserManager { get; }

    protected IRepository<User> UserRepository { get; }

    protected IRepository<OpenService> OpenServiceRepository { get; set; }

    public AccountAppService(
        VerificationCodeHelper verificationCodeHelper,
        SmsHelper smsHelper,
        TenantManager tenantManager,
        UserManager<User> userManager,
        IRepository<User> userRepository,
        IRepository<OpenService> openServiceRepository)
    {
        VerificationCodeHelper = verificationCodeHelper;
        SmsHelper = smsHelper;
        TenantManager = tenantManager;
        UserManager = userManager;
        UserRepository = userRepository;
        OpenServiceRepository = openServiceRepository;
    }

    public VerificationCode GetVerificationCode()
    {
        return VerificationCodeHelper.CreateImages();
    }

    public void SendRegisterSmsAsync(SendSmsInput input)
    {
        SendSmsAsync(input, SmsType.Register);
    }

    public void SendResetPasswordSmsAsync(SendSmsInput input)
    {
        SendSmsAsync(input, SmsType.ResetPassword);
    }

    protected void SendSmsAsync(SendSmsInput input, SmsType type)
    {
        bool pass = VerificationCodeHelper.Verify(input.VerificationCodeSign, input.Position);
        if (!pass)
        {
            throw new UserFriendlyException("图形验证失败");
        }

        SmsHelper.SendSms($"+86{input.Phone}", type);
    }

    public async Task Register(RegisterInput input)
    {
        bool pass = SmsHelper.Verify($"+86{input.Phone}", input.SmsCode, SmsType.Register);
        if (!pass)
        {
            throw new UserFriendlyException("无效的验证码");
        }

        var tenant = await TenantManager.CreateAsync(input.Phone, input.Password);
        // 赠送服务
        var openServices = new List<OpenService>();
        var now = DateTime.Now;
        foreach (var item in WebConfiguration.AuthConfig.GiveOpenServices)
        {
            openServices.Add(new OpenService(GuidGenerator.Create(), item.Name, now.AddDays(item.Daynum), tenant.Id));
        }
        await OpenServiceRepository.InsertManyAsync(openServices);
    }

    public async Task<string> ResetPasswordVerify(ResetPasswordVerifyInput input)
    {
        bool pass = SmsHelper.Verify($"+86{input.Phone}", input.SmsCode, SmsType.ResetPassword);
        if (!pass)
        {
            throw new UserFriendlyException("无效的验证码");
        }

        using (DataFilter.Disable<IMultiTenant>())
        {
            var user = await UserManager.FindByNameAsync(input.Phone);
            if (user == null)
            {
                throw new UserFriendlyException("该手机号未注册");
            }
            return await UserManager.GeneratePasswordResetTokenAsync(user);
        }
    }

    public async Task ResetPassword(ResetPasswordInput input)
    {
        using (DataFilter.Disable<IMultiTenant>())
        {
            var user = await UserManager.FindByNameAsync(input.Phone);
            if (user == null)
            {
                throw new UserFriendlyException("该手机号未注册");
            }
            var result = await UserManager.ResetPasswordAsync(user, input.Token, input.Password);
            result.CheckResult();
        }
    }

    [Authorize]
    public async Task<UserDto?> GetCurrentUser()
    {
        var user = await UserRepository.FirstOrDefaultAsync(e => e.Id == CurrentUser.Id);
        return ObjectMapper.Map<User, UserDto>(user);
    }

    // [Authorize]
    // public virtual async Task ChangePasswordAsync(ChangePasswordInput input)
    // {
    //     var user = await UserManager.FindByIdAsync(CurrentUser.Id.Value.ToString());
    //     if (user == null)
    //     {
    //         throw new Exception($"异常用户{CurrentUser.Id}");
    //     }

    //     var result = await UserManager.ChangePasswordAsync(user, input.OldPassword, input.NewPassword);
    //     result.CheckResult();
    // }
}