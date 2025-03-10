using Ice.Utils;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Warehouses.Dtos
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }
    }
}
