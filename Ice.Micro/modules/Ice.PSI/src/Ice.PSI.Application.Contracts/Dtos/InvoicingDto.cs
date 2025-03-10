using System;

namespace Ice.PSI.Dtos;

public class InvoicingDto
{
    public Guid Id { get; set; }
    
    /// <summary>
    /// 年
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public int Month { get; set; }

    /// <summary>
    /// Sku
    /// </summary>
    public string Sku { get; set; }

    /// <summary>
    /// 销售数量
    /// </summary>
    public int SaleQuantity { get; set; }

    /// <summary>
    /// 销售金额
    /// </summary>
    public decimal SaleAmount { get; set; }

    /// <summary>
    /// 入库数量
    /// </summary>
    public int InboundQuantity { get; set; }

    /// <summary>
    /// 入库金额
    /// </summary>
    public decimal InboundAmount { get; set; }

    /// <summary>
    /// 结余库存
    /// </summary>
    public int EndStock { get; set; }

    /// <summary>
    /// 结余金额
    /// </summary>
    public decimal EndAmount { get; set; }
}