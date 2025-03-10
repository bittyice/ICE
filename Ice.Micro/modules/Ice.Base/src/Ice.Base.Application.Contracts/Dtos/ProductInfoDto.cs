using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Data;

namespace Ice.Base.Dtos
{
    public class ProductInfoDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; set; }

        /// <summary>
        /// 产品名称
        /// </summary>
        public string Name { get; set; }

        // 产品价格
        public decimal Price { get; set; }

        /// <summary>
        /// 单位（如件、箱、托等）
        /// </summary>
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

        public string? ExtraInfo { get; set; }

        public string? Brand { get; set; }

        public Guid? ClassifyId { get; set; }

        public ICollection<UnboxProductDto> UnboxProducts { get; set; }
    }
}
