using Ice.Base.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.Base.Services.ProductInfos
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? Sku { get; set; }

        public string? Name { get; set; }

        public Guid? ClassifyId { get; set; }
    }
}
