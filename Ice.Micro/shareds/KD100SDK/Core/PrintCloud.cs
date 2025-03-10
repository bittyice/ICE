
using KD100SDK.Utils;
using KD100SDK.Common;
using KD100SDK.Common.Request;
using KD100SDK.Common.Request.Electronic;
using KD100SDK.Common.Request.Electronic.Print;

namespace KD100SDK.Core;
public class PrintCloud{
    public static string query(PrintCloudReq param){

        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.ELECTRONIC_ORDER_PRINT_URL,request);
        return result;
    }

    /// <summary>
    /// 面单取消
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static CommonRespone cancel(BaseReq<CancelPrintParam> param){
        param.method = ApiInfoConstant.CANCEL_METHOD;
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.ELECTRONIC_ORDER_HTML_URL,request);
        return System.Text.Json.JsonSerializer.Deserialize<CommonRespone>(result);
    }
}   