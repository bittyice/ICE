using Ice.Utils;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Transfers.Dtos
{
    public class GetTransferSkusInput : IcePageRequestDto
    {
        [Required]
        public Guid WarehouseId { get; set; }

        public string Sku { get; set; }
    }
}
