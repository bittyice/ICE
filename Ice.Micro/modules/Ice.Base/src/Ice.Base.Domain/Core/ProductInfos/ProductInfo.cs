using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Base.Core.ProductInfos
{
    public class ProductInfo : AggregateRoot<Guid>, IMultiTenant, IDeletionAuditedObject, IHasDeletionTime, ISoftDelete
    {
        protected ProductInfo() { }

        public ProductInfo(Guid id, string sku, string name, Guid? tenantId)
        {
            Id = id;
            Sku = sku;
            Name = name;
            UnboxProducts = new List<UnboxProduct>();
            TenantId = tenantId;
        }

        // SKU
        public string Sku { get; protected set; }

        // 产品名称
        public string Name { get; set; }

        // 产品价格
        public decimal Price { get; set; }

        // 单位（如件、箱、托等）
        public string? Unit { get; set; }

        public double Volume { get; set; }

        public string? VolumeUnit { get; set; }

        public double Weight { get; set; }

        public string? WeightUnit { get; set; }

        public string? Specification { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 品牌
        /// </summary>
        public string? Brand { get; set; }

        public Guid? TenantId { get; protected set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeletionTime { get; set; }

        public Guid? DeleterId { get; set; }

        /// <summary>
        /// 扩展信息（仅供前端使用）
        /// </summary>
        public string? ExtraInfo { get; set; }

        /// <summary>
        /// 分类，这里不需要建立外键关系
        /// </summary>
        public Guid? ClassifyId { get; set; }

        /// <summary>
        /// 拆箱产品
        /// </summary>
        public ICollection<UnboxProduct> UnboxProducts { get; set; }
    }
}
