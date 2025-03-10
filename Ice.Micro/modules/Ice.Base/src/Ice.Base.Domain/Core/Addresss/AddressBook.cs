using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Base.Core.Addresss
{
    /// <summary>
    /// 地址簿
    /// </summary>
    public class AddressBook : AggregateRoot<Guid>, IMultiTenant
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
        /// 地址
        /// </summary>
        public string? AddressDetail { get; set; }

        /// <summary>
        /// 邮编
        /// </summary>
        public string? Postcode { get; set; }

        public Guid? TenantId { get; protected set; }

        protected AddressBook() { }

        public AddressBook(Guid id, Guid tenantId)
        {
            Id = id;
            TenantId = tenantId;
        }
    }
}
