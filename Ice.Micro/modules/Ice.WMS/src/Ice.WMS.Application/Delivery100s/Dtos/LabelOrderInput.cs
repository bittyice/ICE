using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Delivery100s.Dtos
{
    public class LabelOrderInput
    {
        [Required]
        public string OrderNumber { get; set; }

        /// <summary>
        /// 使用得快递
        /// </summary>
        [Required]
        public Guid DeliveryId { get; set; }

        /// <summary>
        /// 支付类型
        /// </summary>
        [Required]
        public string PayType { get; set; }

        /// <summary>
        /// 业务类型
        /// </summary>
        [Required]
        public string ExpType { get; set; }

        /// <summary>
        /// 物品名称
        /// </summary>
        public string Cargo { get; set; }

        /// <summary>
        /// 发件人信息
        /// </summary>
        [Required]
        public ExpressBillInputAddress Sender { get; set; } = new ExpressBillInputAddress();

        /// <summary>
        /// 收件人信息
        /// </summary>
        [Required]
        public ExpressBillInputAddress Receiver { get; set; } = new ExpressBillInputAddress();
    }

    public class ExpressBillInputAddress
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Mobile { get; set; }

        [Required]
        public string Address { get; set; }
    }
}
