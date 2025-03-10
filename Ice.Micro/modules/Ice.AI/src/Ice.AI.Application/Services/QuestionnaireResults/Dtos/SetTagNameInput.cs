using System.ComponentModel.DataAnnotations;
using Ice.Utils;

public class SetTagNameInput
{
    [Required]
    [MaxLength(Consts.MinTextLength)]
    public string TagName { get; set; }
}