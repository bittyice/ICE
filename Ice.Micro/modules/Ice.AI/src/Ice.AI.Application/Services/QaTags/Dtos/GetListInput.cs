using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.AI.Services.QaTags
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }
    }
}
