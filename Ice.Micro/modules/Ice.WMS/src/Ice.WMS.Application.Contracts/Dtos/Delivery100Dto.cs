using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class Delivery100Dto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// 快递公司
        /// </summary>
        public string Kuaidicom { get; set; }

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
    }
}
