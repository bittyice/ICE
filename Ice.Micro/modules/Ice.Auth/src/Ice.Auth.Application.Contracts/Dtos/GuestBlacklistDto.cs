using System;

namespace Ice.Auth.Dtos;

public class GuestBlacklistDto
{
    public Guid Id { get; set; }

    public string Ip { get; set; }

    public DateTimeOffset CreationTime { get; set; }
}