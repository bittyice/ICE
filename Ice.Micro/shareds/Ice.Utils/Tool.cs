
using System;

namespace Ice.Utils;

public static class Tool
{
    static Random ran = new Random();

    /// <summary>
    /// 通用编码生成
    /// </summary>
    /// <returns></returns>
    public static string CommonCodeCreate()
    {
        return DateTime.Now.ToString("yyyyMMddHHmmss");
    }

    /// <summary>
    /// 生成通用的订单号
    /// </summary>
    /// <returns></returns>
    public static string CommonOrderNumberCreate()
    {
        return DateTime.Now.ToString("yyMMddHHmmssffff") + ran.Next(100000, 999999);
    }

    private static char[] constant =
    {
            '0','1','2','3','4','5','6','7','8','9',
            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
            'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
         };
    public static string GenerateRandomNumber(int Length)
    {
        System.Text.StringBuilder newRandom = new System.Text.StringBuilder(62);
        Random rd = new Random();
        for (int i = 0; i < Length; i++)
        {
            newRandom.Append(constant[rd.Next(62)]);
        }
        return newRandom.ToString();
    }
}