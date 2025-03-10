using Ice.Utils;
using Ice.WMS.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Ice.WMS.Locations.Dtos
{
    public class GetListInput : IcePageRequestDto
    {
        public Guid? Id { get; set; }

        public string Code { get; set; }

        public Guid? AreaId { get; set; }

        public Guid? WarehouseId { get; set; }
    }
}
