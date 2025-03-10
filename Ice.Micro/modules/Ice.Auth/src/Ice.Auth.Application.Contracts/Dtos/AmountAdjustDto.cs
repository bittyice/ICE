using System;

namespace Ice.Auth.Dtos;

public class AmountAdjustDto
{
    public Guid Id { get; set; }

    public int OldAmount { get; set; }

    public string Type { get; set; }

    public int AdjustFee { get; set; }

    public string OuterNumber { get; set; }

    public string Remark { get; set; }

    public DateTimeOffset CreationTime { get; set; }
}