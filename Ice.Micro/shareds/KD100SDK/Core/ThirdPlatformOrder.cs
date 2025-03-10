using KD100SDK.Common.Request;
using KD100SDK.Common.Request.thirdPlatform;
using KD100SDK.Utils;
using KD100SDK.Common;

namespace KD100SDK.Core;
/// <summary>
/// 订单导入
/// </summary>
public static class ThirdPlatformOrder
{

    /// <summary>
    /// 获取店铺授权超链接接口
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static BaseRespone<StoreAuthRespone> auth(BaseReq<StoreAuthParam> param){
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        var result = HttpUtils.doPostForm(ApiInfoConstant.THIRD_PLATFORM_ORDER_SHOP_AUTHORIZE_url,request);
        return System.Text.Json.JsonSerializer.Deserialize<BaseRespone<StoreAuthRespone>>(result);
    }

    /// <summary>
    /// 提交订单获取任务接口
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static BaseRespone<CommitTaskRespone> commitTask(BaseReq<CommitTaskParam> param){
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        var result = HttpUtils.doPostForm(ApiInfoConstant.THIRD_PLATFORM_ORDER_COMMIT_TASK,request);
        return System.Text.Json.JsonSerializer.Deserialize<BaseRespone<CommitTaskRespone>>(result);
    }

    /// <summary>
    /// 快递单号回传及订单发货接口
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string uploadNum(BaseReq<UploadNumParam> param){
        
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        var result = HttpUtils.doPostForm(ApiInfoConstant.THIRD_PLATFORM_ORDER_UPLOAD_NUM,request);
        return result;
    }

    /// <summary>
    /// 第三方电商平台账号授权
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string platformAuth(BaseReq<PlatformAuthParam> param){
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        var result = HttpUtils.doPostForm(ApiInfoConstant.AUTH_THIRD_URL,request);
        return result;
    }

    /// <summary>
    /// 面单余额
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string branchInfo(BaseReq<BranchInfoParam> param){
        param.method = ApiInfoConstant.THIRD_PLATFORM_BRANCH_INFO_METHOD;
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        var result = HttpUtils.doPostForm(ApiInfoConstant.ELECTRONIC_ORDER_HTML_URL,request);
        return result;
    }


}