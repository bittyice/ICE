using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class LocationDto
    {
        public Guid Id { get; set; }

        public string Code { get; set; }

        public bool Often { get; set; }

        public Guid? TenantId { get; set; }

        public Guid AreaId { get; set; }

        public ICollection<LocationDetailDto> LocationDetails { get; set; }
    }
}
