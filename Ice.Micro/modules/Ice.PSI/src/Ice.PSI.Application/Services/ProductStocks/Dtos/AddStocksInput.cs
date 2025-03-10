using System.Collections.Generic;

namespace Ice.PSI.Services.ProductStocks;

public class AddStocksInput
{
    public List<AddStocksInputItem> Items { get; set; }
}

public class AddStocksInputItem
{
    public string Sku { get; set; }
    public int Stock { get; set; }
}