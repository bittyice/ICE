using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.Base.Services.AddressBooks
{
    public class UpdateInput
    {
        /// <summary>
        /// 名称
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 联系人
        /// </summary>
        public string? Contact { get; set; }

        /// <summary>
        /// 联系电话
        /// </summary>
        public string? ContactNumber { get; set; }

        public string? Province { get; set; }

        public string? City { get; set; }

        public string? Town { get; set; }

        public string? Street { get; set; }

        /// <summary>
        /// 地址
        /// </summary>
        public string? AddressDetail { get; set; }

        /// <summary>
        /// 邮编
        /// </summary>
        public string? Postcode { get; set; }
    }
}
