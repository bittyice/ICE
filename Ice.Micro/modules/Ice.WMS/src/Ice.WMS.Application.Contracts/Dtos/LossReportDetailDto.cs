using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class LossReportDetailDto
    {
        public Guid Id { get; set; }

        public string Sku { get; set; }

        public int Quantity { get; set; }

        public Guid LossReportOrderId { get; set; }
    }
}
