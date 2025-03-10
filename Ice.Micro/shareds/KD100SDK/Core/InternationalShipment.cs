using KD100SDK.Common.Request;
using KD100SDK.Common.Request.internationalshipment;
using KD100SDK.Utils;
using KD100SDK.Common;

namespace KD100SDK.Core;
/// <summary>
/// 国际电子面单API
/// </summary>
public static class InternationalShipment
{

    /// <summary>
    /// 获取面单
    /// </summary>
    /// <param name="param"></param>
    /// <returns></returns>
     public static string getLabel(BaseReq<ShipmentReq> param){
        
    
        var request = ObjectToDictionaryUtils.ObjectToMap(param);
        
        if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.INTERNATIONAL_SHIPMENT_URL,request);
        return result;
    }


}