using Ice.PSI.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Invoicings
{
    public class UpdateMonthInvoicingsInput
    {
        public int Year { get; set; }

        public int Month { get; set; }

        public List<UpdateMonthInvoicingsInputItem> Items { get; set; }
    }

    public class UpdateMonthInvoicingsInputItem {
        /// <summary>
        /// Sku
        /// </summary>
        public string Sku { get; set; }

        /// <summary>
        /// 销售数量
        /// </summary>
        public int SaleQuantity { get; set; }

        /// <summary>
        /// 销售金额
        /// </summary>
        public decimal SaleAmount { get; set; }

        /// <summary>
        /// 入库数量
        /// </summary>
        public int InboundQuantity { get; set; }

        /// <summary>
        /// 入库金额
        /// </summary>
        public decimal InboundAmount { get; set; }

        /// <summary>
        /// 结余库存
        /// </summary>
        public int EndStock { get; set; }

        /// <summary>
        /// 结余金额
        /// </summary>
        public decimal EndAmount { get; set; }
    }
}
