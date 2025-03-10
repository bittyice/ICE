using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Base.Core.Classifys
{
    public class Classify : AggregateRoot<Guid>, IMultiTenant
    {
        public string Name { get; set; }

        /// <summary>
        /// 父分类，不建立外键
        /// </summary>
        public Guid? ParentId { get; set; }

        public Guid? TenantId { get; set; }

        protected Classify() { }

        public Classify(Guid id, string name, Guid tenantId) { 
            Id = id;
            Name = name;
            TenantId = tenantId;
        }
    }
}
