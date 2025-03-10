using Ice.PSI.Core.Contracts;
using Ice.PSI.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;
using Ice.PSI.Filters.MaxResources;

namespace Ice.PSI.Services.Contracts
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class ContractAppService: PSIAppService
    {
        protected IRepository<Contract, Guid> ContractRepository { get; }

        public ContractAppService(
            IRepository<Contract, Guid> contractRepository
        )
        {
            ContractRepository = contractRepository;
        }

        public async Task<PagedResultDto<ContractDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(Contract.CreationTime)
                && sorting != nameof(Contract.ContractName)
                && sorting != nameof(Contract.ContractNumber)
                )
            {
                sorting = nameof(Contract.CreationTime);
            }

            IQueryable<Contract> queryable = await ContractRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.ContractName))
            {
                queryable = queryable.Where(e => e.ContractName == input.ContractName);
            }

            if (!string.IsNullOrWhiteSpace(input.ContractNumber))
            {
                queryable = queryable.Where(e => e.ContractNumber == input.ContractNumber);
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
            List<Contract> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<ContractDto>(
                count,
                ObjectMapper.Map<List<Contract>, List<ContractDto>>(list)
            );
        }

        public async Task<ContractDto> GetAsync(Guid id)
        {
            var entity = await ContractRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Contract, ContractDto>(entity);
        }

        [ContractResource]
        public async Task CreateAsync(CreateInput input)
        {
            var contract = new Contract(GuidGenerator.Create(), input.ContractNumber, input.ContractName, input.SupplierId);
            contract.EffectiveTime = input.EffectiveTime?.LocalDateTime;
            contract.Expiration = input.Expiration?.LocalDateTime;
            contract.ExtraInfo = input.ExtraInfo;
            contract.AppendixUrl = input.AppendixUrl;

            await ContractRepository.InsertAsync(contract);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var contract = await ContractRepository.FindAsync(id);
            if (contract == null)
            {
                throw new EntityNotFoundException();
            }

            contract.ContractName = input.ContractName;
            contract.ContractNumber = input.ContractNumber;
            contract.EffectiveTime = input.EffectiveTime?.LocalDateTime;
            contract.Expiration = input.Expiration?.LocalDateTime;
            contract.ExtraInfo = input.ExtraInfo;
            contract.AppendixUrl = input.AppendixUrl;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await ContractRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
