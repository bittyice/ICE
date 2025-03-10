using Ice.PSI.Core;
using Ice.PSI.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ice.PSI.Services.PaymentMethods
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? Name { get; set; }
    }
}
