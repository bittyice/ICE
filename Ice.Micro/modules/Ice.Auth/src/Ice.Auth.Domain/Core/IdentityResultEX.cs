using System.Linq;
using Microsoft.AspNetCore.Identity;
using Volo.Abp;

namespace Ice.Auth.Core;

public static class IdentityResultEX {
    public static void CheckResult(this IdentityResult result) {
        if (result.Succeeded)
            {
                return;
            }

            if (result.Errors.Count() == 0)
            {
                throw new UserFriendlyException("密码更新失败，未知异常");
            }

            var code = result.Errors.First().Code;
            if (code == "DuplicateUserName")
            {
                throw new UserFriendlyException("该手机号已被注册，无法重复注册");
            }

            if (code == "PasswordMismatch")
            {
                throw new UserFriendlyException("密码输入错误");
            }

            if (code == "PasswordRequiresNonAlphanumeric")
            {
                throw new UserFriendlyException("密码必须包含一个特殊字符，如.,/*?等");
            }

            if (code == "PasswordRequiresLower")
            {
                throw new UserFriendlyException("密码必须包含一个小写字符");
            }

            if (code == "PasswordRequiresUpper")
            {
                throw new UserFriendlyException("密码必须包含一个大写字符");
            }

            if (code == "PasswordRequiresDigit")
            {
                throw new UserFriendlyException("密码必须包含数字");
            }

            if (code == "PasswordTooShort")
            {
                throw new UserFriendlyException("密码至少6位");
            }

            throw new UserFriendlyException(result.Errors.First().Description);
    }
}