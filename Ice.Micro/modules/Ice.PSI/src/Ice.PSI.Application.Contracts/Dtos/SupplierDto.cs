using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.PSI.Dtos
{
    public class SupplierDto
    {
        public Guid Id { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        public string Contact { get; set; }

        public string ContactNumber { get; set; }

        public bool IsActive { get; set; }

        public string ExtraInfo { get; set; }

        public DateTimeOffset? LastModificationTime { get; set; }

        public Guid? LastModifierId { get; set; }

        public DateTimeOffset CreationTime { get; set; }
    }
}
