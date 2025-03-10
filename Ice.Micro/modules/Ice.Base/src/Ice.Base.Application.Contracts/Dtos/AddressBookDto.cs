using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.Base.Dtos
{
    public class AddressBookDto
    {
        public Guid Id { get; set; }

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

        /// <summary>
        /// 所在省份
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
        /// 详细地址
        /// </summary>
        public string? AddressDetail { get; set; }

        /// <summary>
        /// 邮编
        /// </summary>
        public string? Postcode { get; set; }
    }
}
