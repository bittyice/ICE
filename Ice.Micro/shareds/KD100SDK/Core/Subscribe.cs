
using System.Collections;
using Newtonsoft.Json;
using System.Collections.Generic;
using KD100SDK.Utils;
using KD100SDK.Common;
using KD100SDK.Common.Request.Subscribe;

namespace KD100SDK.Core;
public class Subscribe{


    public static string subscribe(SubscribeReq subscribeReq){
        
        var request = ObjectToDictionaryUtils.ObjectToMap(subscribeReq);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.SUBSCRIBE_URL,request);
        return result;
    }
}   