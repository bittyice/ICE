namespace Ice.WMS;

public static class WMSErrorCodes
{
    //Add your business exception error codes here...

    /// <summary>
    /// 入库单号重复
    /// </summary>
    public static string InboundNumberRepeat = "Ice.WMS:010001";

    /// <summary>
    /// 出库单号重复
    /// </summary>
    public static string OutboundNumberRepeat = "Ice.WMS:020001";

    /// <summary>
    /// 拣货单号重复
    /// </summary>
    public static string PickListNumberRepeat = "Ice.WMS:030001";
}
