namespace Ice.WMS.Others;

public class SearchOrderOutput
{

}

public class SearchOrderOutputItem
{
    public string OrderNumber { get; set; }

    // 取值 IN, OUT
    public string Type { get; set; }
}