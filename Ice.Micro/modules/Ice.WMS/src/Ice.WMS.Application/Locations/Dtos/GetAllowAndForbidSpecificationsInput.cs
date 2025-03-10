using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Locations.Dtos
{
    public class GetAllowAndForbidSpecificationsInput
    {
        [Required]
        public string Code { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }
    }
}
