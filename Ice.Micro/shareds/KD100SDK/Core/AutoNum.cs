using KD100SDK.Common;
using KD100SDK.Utils;

namespace KD100SDK.Core;
public static class AutoNum
{
    public static string query(string num, string key)
    {
        var url = string.Format(ApiInfoConstant.AUTO_NUM_URL,num,key);
        var result = HttpUtils.doGet(url);
        return result;
    }
}
