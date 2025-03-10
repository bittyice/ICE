using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Delivery100s.Dtos
{
    public class PullOrderInput
    {
        public string ShopType { get; set; }

        public string OrderStatus { get; set; }

        public long StartTimeStamp { get; set; }

        public long EndTimeStamp { get; set; }

        public Guid? Group { get; set; }

        [Required]
        public string Source { get; set; }
    }
}
