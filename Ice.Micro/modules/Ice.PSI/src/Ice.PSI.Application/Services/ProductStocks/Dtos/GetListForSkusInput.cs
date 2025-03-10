using System.Collections.Generic;

namespace Ice.PSI.Services.ProductStocks;

public class GetListForSkusInput
{
    public List<string> Skus { get; set; }
}