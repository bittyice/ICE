using System.Collections.Generic;

namespace Ice.PSI.Services.ProductStocks;

public class SetStocksInput
{
    public List<SetStocksInputItem> Items { get; set; }
}

public class SetStocksInputItem
{
    public string Sku { get; set; }
    public int Stock { get; set; }
}