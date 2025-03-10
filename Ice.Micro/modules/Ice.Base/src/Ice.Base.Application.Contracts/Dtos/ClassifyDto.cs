using System;
using System.Collections.Generic;
using System.Text;

namespace Ice.Base.Dtos
{
    public class ClassifyDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public Guid? ParentId { get; set; }
    }
}
