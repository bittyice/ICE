using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.WMS.Dtos
{
    public class WarehouseMessageDto
    {
        public Guid Id { get; set; }

        public string Title { get; set; }

        public string Message { get; set; }

        public bool Readed { get; set; }

        public Guid ReadId { get; set; }

        public Guid WarehouseId { get; set; }

        public DateTimeOffset CreationTime { get; set; }

        public Guid? TenantId { get; set; }
    }
}
