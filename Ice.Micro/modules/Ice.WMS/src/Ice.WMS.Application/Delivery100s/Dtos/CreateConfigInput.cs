using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.WMS.Delivery100s.Dtos
{
    public class CreateConfigInput
    {
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
    }
}
