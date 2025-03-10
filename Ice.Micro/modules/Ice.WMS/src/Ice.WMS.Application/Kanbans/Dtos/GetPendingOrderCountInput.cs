using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Kanbans.Dtos
{
    public class GetPendingOrderCountInput
    {
        [Required]
        public Guid WarehouseId { get; set; }
    }
}
