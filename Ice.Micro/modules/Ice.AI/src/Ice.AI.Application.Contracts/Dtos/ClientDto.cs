using System;

namespace Ice.AI.Dtos;

public class ClientDto
{
    public Guid Id { get; set; }

    public string? Name { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    // 使用意向 ClientIntentionType
    public string Intention { get; set; }

    public DateTimeOffset CreationTime { get; set; }
}