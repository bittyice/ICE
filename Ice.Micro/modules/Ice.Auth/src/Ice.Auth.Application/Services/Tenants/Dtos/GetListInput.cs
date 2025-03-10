using System;
using Ice.Utils;

namespace Ice.Auth.Services.Tenants;

public class GetListInput : IcePageRequestDto
{
    public Guid? Id { get; set; }
}