using Ice.Base.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.Base.Services.AddressBooks
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string? Name { get; set; }
    }
}
