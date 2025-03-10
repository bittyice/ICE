using System;

namespace Ice.AI.Dtos;

public class CsTextDto
{
    public Guid Id { get; set; }

    // 组名称
    public string GroupName { get; set; }

    // 文本列表，Json格式
    public string TextList { get; set; }
}