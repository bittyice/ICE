using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.Kanbans
{
    public class GetFeeAnalyseOutput
    {
        public int OrderTotal { get; set; }

        public int SkuTotal { get; set; }

        public decimal FeeTotal { get; set; }

        public decimal FeeTotalPaid { get; set; }

        public List<GetFeeAnalyseOutputPaymentMethodItem> PaymentMethodDetails { get; set; }
    }

    public class GetFeeAnalyseOutputPaymentMethodItem
    {
        public Guid? PaymentMethodId { get; set; }
        public decimal FeeTotal { get; set; }
        public decimal FeeTotalPaid { get; set; }
    }

    public class GetAllFeeAnalyseOutput
    {
        public GetFeeAnalyseOutput Purchase { get; set; }
        public GetFeeAnalyseOutput PurchaseReturn { get; set; }
        public GetFeeAnalyseOutput Sale { get; set; }
        public GetFeeAnalyseOutput SaleReturn { get; set; }
    }
}
