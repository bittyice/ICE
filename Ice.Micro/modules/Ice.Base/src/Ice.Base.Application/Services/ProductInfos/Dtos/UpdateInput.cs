using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Volo.Abp.Data;

namespace Ice.Base.Services.ProductInfos
{
    public class UpdateInput
    {
        [Required]
        public string Name { get; set; }

        public decimal? Price { get; set; }

        public string? Unit { get; set; }

        public double? Volume { get; set; }

        public string? VolumeUnit { get; set; }

        public double? Weight { get; set; }

        public string? WeightUnit { get; set; }

        public string? Specification { get; set; }

        public string? Remark { get; set; }

        public string? ExtraInfo { get; set; }

        public Guid? ClassifyId { get; set; }

        public string? Brand { get; set; }

        [MaxLength(100, ErrorMessage = "最多只能包含100种拆箱产品")]
        public List<UpdateInputItem>? UnboxProducts { get; set; }
    }


    public class UpdateInputItem
    {
        public string Sku { get; set; }

        public int Quantity { get; set; }
    }
}
