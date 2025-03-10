using Ice.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.Auth.Services.GuestBlacklists
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? Ip { get; set; }

        public DateTimeOffset? CreationTimeMin { get; set; }

        public DateTimeOffset? CreationTimeMax { get; set; }
    }
}
