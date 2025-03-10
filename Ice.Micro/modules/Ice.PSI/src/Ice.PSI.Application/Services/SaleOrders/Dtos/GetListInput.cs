using Ice.PSI.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.PSI.Services.SaleOrders
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? OrderNumber { get; set; }

        public string? Seller { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }

        public string? Status { get; set; }

        public string? BusinessName { get; set; }
    }
}
