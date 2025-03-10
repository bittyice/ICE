
using KD100SDK.Utils;
using KD100SDK.Common;
using KD100SDK.Common.Request.Electronic.Html;

namespace KD100SDK.Core;
public class PrintHtml{


    public static string query(PrintHtmlReq param){
        
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.ELECTRONIC_ORDER_HTML_URL,request);
        return result;
    }
}   