using System.Collections.Generic;

namespace Ice.PSI.Services.Kanbans;

public class GetSkuRankingOutput
{
}

public class GetSkuRankingOutputItem
{
    public string Sku { get; set; }

    public int Quantity { get; set; }
}