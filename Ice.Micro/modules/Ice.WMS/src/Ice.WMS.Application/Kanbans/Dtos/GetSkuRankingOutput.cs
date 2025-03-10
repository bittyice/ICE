using System.Collections.Generic;

namespace Ice.WMS.Kanbans.Dtos;

public class GetSkuRankingOutput
{
}

public class GetSkuRankingOutputItem
{
    public string Sku { get; set; }

    public int Quantity { get; set; }
}