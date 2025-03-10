using System;
using Ice.Utils;

namespace Ice.Auth.Services.AmountAdjusts;

public class GetListInput : IcePageRequestDto
{
    public Guid? Id { get; set; }

    public string? Type { get; set; }

    public DateTimeOffset? CreationTimeMin { get; set; }

    public DateTimeOffset? CreationTimeMax { get; set; }
}