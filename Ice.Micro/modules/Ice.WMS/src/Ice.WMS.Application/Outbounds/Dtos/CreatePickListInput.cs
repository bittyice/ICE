using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Outbounds.Dtos
{
    public class CreatePickListInput
    {
        /// <summary>
        /// 出库单Id
        /// </summary>
        [MaxLength(length: 100, ErrorMessage = "最多包含100条出库单")]
        [MinLength(length: 0, ErrorMessage = "至少包含一条出库单")]
        public List<Guid> OutboundOrderIds { get; set; }

        /// <summary>
        /// 拣货单号
        /// </summary>
        [Required]
        [RegularExpression("^[a-z|A-Z|0-9]{6,}$", ErrorMessage = "拣货单号必须是6位以上的字符或数字")]
        public string PickListNumber { get; set; }
    }
}
