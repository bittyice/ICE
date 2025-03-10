using Ice.PSI.Core.Suppliers;
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

namespace Ice.PSI.Services.Suppliers
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class SupplierAppService : PSIAppService
    {
        protected IRepository<Supplier, Guid> SupplierRepository { get; }

        protected SupplierManager SupplierManager { get; }

        public SupplierAppService(
            IRepository<Supplier, Guid> supplierRepository,
            SupplierManager supplierManager)
        {
            SupplierRepository = supplierRepository;
            SupplierManager = supplierManager;
        }

        public async Task<PagedResultDto<SupplierDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(Supplier.CreationTime)
                && sorting != nameof(Supplier.Code)
                && sorting != nameof(Supplier.Name)
                && sorting != nameof(Supplier.Contact)
                && sorting != nameof(Supplier.ContactNumber)
                )
            {
                sorting = nameof(Supplier.CreationTime);
            }

            IQueryable<Supplier> queryable = await SupplierRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Code))
            {
                queryable = queryable.Where(e => e.Code == input.Code);
            }

            if (!string.IsNullOrWhiteSpace(input.Name))
            {
                queryable = queryable.Where(e => e.Name == input.Name);
            }

            if (!string.IsNullOrWhiteSpace(input.Contact))
            {
                queryable = queryable.Where(e => e.Contact == input.Contact);
            }

            if (!string.IsNullOrWhiteSpace(input.ContactNumber))
            {
                queryable = queryable.Where(e => e.ContactNumber == input.ContactNumber);
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
            List<Supplier> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<SupplierDto>(
                count,
                ObjectMapper.Map<List<Supplier>, List<SupplierDto>>(list)
            );
        }

        public async Task<SupplierDto> GetAsync(Guid id)
        {
            var entity = (await SupplierRepository.FindAsync(id));
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Supplier, SupplierDto>(entity);
        }

        [SupplierResource]
        public async Task CreateAsync(CreateInput input)
        {
            var supplier = new Supplier(GuidGenerator.Create(), input.Code, input.Name, input.Contact, CurrentUser.TenantId.Value);
            supplier.ContactNumber = input.ContactNumber;
            supplier.IsActive = input.IsActive;
            supplier.ExtraInfo = input.ExtraInfo;
            await SupplierManager.CreateAsync(supplier);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var supplier = (await SupplierRepository.FindAsync(id));
            if (supplier == null)
            {
                throw new EntityNotFoundException();
            }

            supplier.Name = input.Name;
            supplier.Contact = input.Contact;
            supplier.ContactNumber = input.ContactNumber;
            supplier.IsActive = input.IsActive;
            supplier.ExtraInfo = input.ExtraInfo;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await SupplierManager.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
