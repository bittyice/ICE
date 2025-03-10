namespace Ice.PSI.Others;

public class SearchOrderOutput
{

}

public class SearchOrderOutputItem
{
    public string OrderNumber { get; set; }

    // 取值 P, PR, S, SR
    public string Type { get; set; }
}