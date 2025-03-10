using System.ComponentModel.DataAnnotations;

namespace Ice.Auth.Services.Pays;

public class RechargeInput
{
    [Range(10, 1000000)]
    public int Price { get; set; }
}