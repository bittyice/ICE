using Ice.Utils;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.AI.Services.Clients
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? Name { get; set; }

        public string? Phone { get; set; }

    }
}
