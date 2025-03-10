using Ice.Base.Dtos;
using Ice.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.Base.Services.Classifys
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public Guid? ParentId { get; set; }
    }
}
