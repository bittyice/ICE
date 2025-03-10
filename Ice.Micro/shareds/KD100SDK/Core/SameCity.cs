using KD100SDK.Common.Request;
using KD100SDK.Common.Request.samecity;
using KD100SDK.Utils;
using KD100SDK.Common;

namespace KD100SDK.Core;
/// <summary>
/// 同城配送
/// </summary>
public static class SameCity
{

    /// <summary>
    /// 同城配送账号授权接口
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string auth(BaseReq<SameCityAuthParam> param){
        
        param.method = ApiInfoConstant.SAME_CITY_AUTH_METHOD;
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.SAME_CITY_ORDER_URL,request);
        return result;
    }

    /// <summary>
    /// 同城配送下单
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string order(BaseReq<SameCityOrderParam> param){
        
        param.method = ApiInfoConstant.SAME_CITY_ORDER_METHOD;
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.SAME_CITY_ORDER_URL,request);
        return result;
    }

    /// <summary>
    /// 同城配送查询订单
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string query(BaseReq<SameCityQueryParam> param){
        
        param.method = ApiInfoConstant.SAME_CITY_QUERY_METHOD;
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.SAME_CITY_ORDER_URL,request);
        return result;
    }

    /// <summary>
    /// 取消下单
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string cancel(BaseReq<SameCityCancelParam> param){
        
        param.method = ApiInfoConstant.SAME_CITY_CANCEL_METHOD;
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.SAME_CITY_ORDER_URL,request);
        return result;
    }
}