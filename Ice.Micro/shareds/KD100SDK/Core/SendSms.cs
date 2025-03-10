
using KD100SDK.Utils;
using KD100SDK.Common;
using KD100SDK.Common.Request;
using KD100SDK.Common.Request.Sms;

namespace KD100SDK.Core;
public class SendSms{


    public static string query(SendSmsReq query){
        
        var request = ObjectToDictionaryUtils.ObjectToMap(query);
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.SEND_SMS_URL,request);
        return result;
    }
}   