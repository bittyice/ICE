using System;
using System.ComponentModel.DataAnnotations;

namespace Ice.WMS.Kanbans.Dtos;

public class GetSkuRankingInput
{
    [Required]
    public Guid WarehouseId { get; set; }
}