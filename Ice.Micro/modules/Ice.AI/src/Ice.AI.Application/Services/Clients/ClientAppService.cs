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
using Ice.AI.Core;
using Ice.AI.Dtos;
using Ice.AI.Filters.MaxResources;

namespace Ice.AI.Services.Clients
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.AIScope)]
    public class ClientAppService : AIAppService
    {
        protected IRepository<Client, Guid> ClientRepository { get; }

        public ClientAppService(
            IRepository<Client, Guid> clientRepository
        )
        {
            ClientRepository = clientRepository;
        }

        public async Task<PagedResultDto<ClientDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(Client.CreationTime);

            IQueryable<Client> queryable = await ClientRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            long count = queryable.Count();
            List<Client> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<ClientDto>(
                count,
                ObjectMapper.Map<List<Client>, List<ClientDto>>(list)
            );
        }

        public async Task<ClientDto> GetAsync(Guid id)
        {
            var entity = await ClientRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Client, ClientDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            var entity = new Client()
            {
                Name = input.Name,
                Phone = input.Phone,
                Email = input.Email,
                Intention = input.Intention,
            };

            await ClientRepository.InsertAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var entity = await ClientRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.Name = input.Name;
            entity.Phone = input.Phone;
            entity.Email = input.Email;
            entity.Intention = input.Intention;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await ClientRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
