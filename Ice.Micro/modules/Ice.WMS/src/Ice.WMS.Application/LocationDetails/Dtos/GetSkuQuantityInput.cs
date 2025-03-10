using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.LocationDetails.Dtos
{
    public class GetSkuQuantityInput
    {
        /// <summary>
        /// 要查询的Sku
        /// </summary>
        public List<string> Skus { get; set; }

        public Guid? Client { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }
    }
}
