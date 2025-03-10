using System.ComponentModel.DataAnnotations;

namespace Ice.Utils;

public class IcePageRequestDto
{
    [Range(1, Consts.PageSizeLength)]
    public virtual int MaxResultCount { get; set; }

    [Range(0, int.MaxValue)]
    public virtual int SkipCount { get; set; }

    /// <summary>
    /// 取值 descend | ascend
    /// </summary>
    public string? SortDirection { get; set; }

    private string? _sorting;

    public string? Sorting
    {
        get
        {
            return _sorting;
        }
        set
        {
            _sorting = value != null ? (value.Substring(0, 1).ToUpper() + value.Substring(1)) : null;
        }
    }
}