
using System.Collections;
using Newtonsoft.Json;
using System.Collections.Generic;
using KD100SDK.Utils;
using KD100SDK.Common;
using KD100SDK.Common.Request;

namespace KD100SDK.Core;
public class QueryTrackWithMap{


    public static string query(QueryTrackReq query){
        
        var request = ObjectToDictionaryUtils.ObjectToMap(query);
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.QUERY_URL_WITH_MAP,request);
        return result;
    }
}   