using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.Delivery100s
{
    public class Delivery100 : AggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// 快递公司
        /// </summary>
        public string Kuaidicom { get; protected set; }

        public string PartnerId { get; set; }

        public string PartnerKey { get; set; }

        public string PartnerSecret { get; set; }

        public string PartnerName { get; set; }

        public string Net { get; set; }

        public string Code { get; set; }

        public string CheckMan { get; set; }

        public string PayType { get; set; }

        public string ExpType { get; set; }

        public bool IsDefault { get; set; }

        public bool IsActive { get; set; }

        public Guid? TenantId { get; protected set; }

        protected Delivery100() { }

        public Delivery100(Guid id, string kuaidicom) { 
            Id = id;
            Kuaidicom = kuaidicom;
            IsActive = true;
        }
    }
}
