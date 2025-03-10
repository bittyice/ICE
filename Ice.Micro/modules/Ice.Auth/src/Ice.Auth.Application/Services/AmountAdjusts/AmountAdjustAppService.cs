using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ice.Auth.Core;
using Ice.Auth.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;

namespace Ice.Auth.Services.AmountAdjusts;

[Authorize(Roles = IceRoleTypes.Admin)]
public class AmountAdjustAppService : AuthAppService
{
    protected IRepository<AmountAdjust, Guid> AmountAdjustRepository { get; }
    public AmountAdjustAppService(
        IRepository<AmountAdjust, Guid> amountAdjustRepository)
    {
        AmountAdjustRepository = amountAdjustRepository;
    }

    public async Task<PagedResultDto<AmountAdjustDto>> GetListAsync(GetListInput input)
    {
        var sorting = input.Sorting;
        if (
            sorting != nameof(AmountAdjust.CreationTime)
            && sorting != nameof(AmountAdjust.Id)
            && sorting != nameof(AmountAdjust.Type)
            )
        {
            sorting = nameof(AmountAdjust.CreationTime);
        }

        IQueryable<AmountAdjust> queryable = await AmountAdjustRepository.GetQueryableAsync();

        if (input.Id != null)
        {
            queryable = queryable.Where(e => e.Id == input.Id);
        }

        if (!string.IsNullOrWhiteSpace(input.Type))
        {
            queryable = queryable.Where(e => e.Type == input.Type);
        }

        if (input.CreationTimeMin != null)
        {
            queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
        }

        if (input.CreationTimeMax != null)
        {
            queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
        }

        long count = queryable.Count();
        List<AmountAdjust> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

        return new PagedResultDto<AmountAdjustDto>(
            count,
            ObjectMapper.Map<List<AmountAdjust>, List<AmountAdjustDto>>(list)
        );
    }
}