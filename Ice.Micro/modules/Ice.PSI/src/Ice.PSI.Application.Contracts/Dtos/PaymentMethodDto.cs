using System;

namespace Ice.PSI.Dtos;

public class PaymentMethodDto
{
    public Guid Id { get; set; }
    
    public string Name { get; set; }

    public string? CardNumber { get; set; }

    public string? Describe { get; set; }
}