using KD100SDK.Common;
using KD100SDK.Utils;
using KD100SDK.Common.Request;
using KD100SDK.Common.Request.Electronic.ocr;

namespace KD100SDK.Core;
public static class Ocr
{
    public static string ocr(BaseReq<OcrParam> param)
    {

        var request = ObjectToDictionaryUtils.ObjectToMap(param);
          if(request == null){
            return null;
        }
        var result = HttpUtils.doPostForm(ApiInfoConstant.OCR_URL,request);
        return result;
    }
}
