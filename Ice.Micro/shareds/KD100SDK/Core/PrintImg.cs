
using KD100SDK.Utils;
using KD100SDK.Common;
using KD100SDK.Common.Request.Electronic.Image;

namespace KD100SDK.Core;
public class PrintImg{


    public static string query(PrintImgReq param){
        
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.ELECTRONIC_ORDER_PRINT_URL,request);
        return result;
    }
}   