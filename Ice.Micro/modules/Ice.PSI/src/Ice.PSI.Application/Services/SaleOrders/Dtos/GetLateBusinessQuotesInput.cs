

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Ice.PSI.Services.SaleOrders;

public class GetLateBusinessQuotesInput
{
    public string BusinessName { get; set; }

    [MinLength(1, ErrorMessage = "至少输入一个产品")]
    public List<string> Skus { get; set; }
}