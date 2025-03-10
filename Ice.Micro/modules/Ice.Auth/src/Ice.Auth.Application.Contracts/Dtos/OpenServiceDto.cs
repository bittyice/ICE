using System;

namespace Ice.Auth.Dtos;

public class OpenServiceDto
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public DateTimeOffset ExpireDate { get; set; }

    public DateTimeOffset OpenDate { get; set; }
}