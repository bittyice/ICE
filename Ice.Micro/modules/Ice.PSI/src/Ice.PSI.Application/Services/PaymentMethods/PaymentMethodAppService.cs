using Ice.PSI.Core.PaymentMethods;
using Ice.PSI.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Volo.Abp;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;
using Ice.PSI.Filters.MaxResources;

namespace Ice.PSI.Services.PaymentMethods
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class PaymentMethodAppService : PSIAppService
    {
        protected IRepository<PaymentMethod, Guid> PaymentMethodRepository { get; }

        public PaymentMethodAppService(
            IRepository<PaymentMethod, Guid> paymentMethodRepository)
        {
            PaymentMethodRepository = paymentMethodRepository;
        }

        public async Task<PagedResultDto<PaymentMethodDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(PaymentMethod.Id);

            IQueryable<PaymentMethod> queryable = await PaymentMethodRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Name))
            {
                queryable = queryable.Where(e => e.Name == input.Name);
            }

            long count = queryable.Count();
            List<PaymentMethod> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<PaymentMethodDto>(
                count,
                ObjectMapper.Map<List<PaymentMethod>, List<PaymentMethodDto>>(list)
            );
        }

        public async Task<PaymentMethodDto> GetAsync(Guid id)
        {
            var entity = (await PaymentMethodRepository.FindAsync(id));
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<PaymentMethod, PaymentMethodDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            var paymentMethod = new PaymentMethod(input.Name);
            paymentMethod.CardNumber = input.CardNumber;
            paymentMethod.Describe = input.Describe;
            await PaymentMethodRepository.InsertAsync(paymentMethod);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var paymentMethod = (await PaymentMethodRepository.FindAsync(id));
            if (paymentMethod == null)
            {
                throw new EntityNotFoundException();
            }

            paymentMethod.Name = input.Name;
            paymentMethod.CardNumber = input.CardNumber;
            paymentMethod.Describe = input.Describe;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await PaymentMethodRepository.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
