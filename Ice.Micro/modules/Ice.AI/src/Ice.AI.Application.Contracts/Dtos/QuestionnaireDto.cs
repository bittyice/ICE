using System;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.AI.Dtos;

public class QuestionnaireDto
{
    public Guid Id { get; set; }

    public string Question { get; set; }
}