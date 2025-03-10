using System;
using System.Net.Http;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;
using KD100SDK.Common.Request;
using System.Web;

namespace KD100SDK.Utils
{
    class HttpUtils
    {
        public static string doPostForm(string url, Dictionary<string, string> param)
        {
            using (var client = new HttpClient())
            {
                using (var multipartFormDataContent = new FormUrlEncodedContent(param))
                {
                    var result = client.PostAsync(url, multipartFormDataContent).Result.Content.ReadAsStringAsync().Result;
                    return result;
                }
            }
        }

        public static string doGet(string url)
        {
            using (var client = new HttpClient())
            {
                Console.WriteLine(JsonConvert.SerializeObject(url));
                var result = client.GetAsync(url).Result.Content.ReadAsStringAsync().Result;
                Console.WriteLine(result);
                return result;

            }
        }

         public static string doPostMultipartFormData<T>(string url, String filePath,String filename)
        {
            using (var client = new HttpClient())
            {
                using (var multipartFormDataContent = new MultipartFormDataContent())
                {
                    multipartFormDataContent.Add(new ByteArrayContent(System.IO.File.ReadAllBytes(filePath)), "file", filename);
                    var result = client.PostAsync(url, multipartFormDataContent).Result.Content.ReadAsStringAsync().Result;
                    Console.WriteLine(result);
                    return result;
                }
            }
        }

        public static string buildUrl<T>(string url,  BaseReq<T> baseReq){
             return string.Format(url,baseReq.method,baseReq.t,baseReq.key,baseReq.sign, HttpUtility.UrlEncode(baseReq.param.ToString()));
        }
    }
}
