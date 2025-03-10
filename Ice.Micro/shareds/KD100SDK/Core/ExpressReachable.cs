using KD100SDK.Common.Request;
using KD100SDK.Common.Request.reachable;
using KD100SDK.Utils;
using KD100SDK.Common;

namespace KD100SDK.Core;
/// <summary>
/// 商家寄件（官方快递）
/// </summary>
public static class ExpressReachable
{

    /// <summary>
    /// 可用性查询
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string query(BaseReq<ExpressReachableParam> param){
        
        param.method = ApiInfoConstant.EXPRESS_REACHABLE_METHOD;
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.EXPRESS_REACHABLE_URL,request);
        return result;
    }
}