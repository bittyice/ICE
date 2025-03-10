using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class RecvInfoDto
    {
        /// <summary>
        /// 商户名
        /// </summary>
        public string BusinessName { get; protected set; }

        /// <summary>
        /// 联系人
        /// </summary>
        public string Contact { get; set; }

        /// <summary>
        /// 联系电话
        /// </summary>
        public string ContactNumber { get; set; }

        /// <summary>
        /// 省份
        /// </summary>
        public string? Province { get; set; }

        /// <summary>
        /// 城市
        /// </summary>
        public string? City { get; set; }

        /// <summary>
        /// 区
        /// </summary>
        public string? Town { get; set; }

        /// <summary>
        /// 街道
        /// </summary>
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
