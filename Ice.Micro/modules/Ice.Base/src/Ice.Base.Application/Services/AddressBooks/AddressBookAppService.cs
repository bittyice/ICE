using Ice.Base.Core.Addresss;
using Ice.Base.Dtos;
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
using Ice.Base.Filters.MaxResources;
using Microsoft.AspNetCore.Mvc;

namespace Ice.Base.Services.AddressBooks
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.BaseScope)]
    public class AddressBookAppService : BaseAppService
    {
        protected IRepository<AddressBook, Guid> AddressBookRepository { get; }

        public AddressBookAppService(
            IRepository<AddressBook, Guid> addressBookRepository)
        {
            AddressBookRepository = addressBookRepository;
        }

        public async Task<PagedResultDto<AddressBookDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(AddressBook.Name);

            IQueryable<AddressBook> queryable = await AddressBookRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Name))
            {
                queryable = queryable.Where(e => e.Name.Contains(input.Name));
            }

            long count = queryable.Count();
            List<AddressBook> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<AddressBookDto>(
                count,
                ObjectMapper.Map<List<AddressBook>, List<AddressBookDto>>(list)
            );
        }

        [ActionName("all")]
        [HttpGet]
        public async Task<List<AddressBookDto>> GetAllAsync()
        {
            List<AddressBook> list = await AddressBookRepository.GetListAsync();
            return ObjectMapper.Map<List<AddressBook>, List<AddressBookDto>>(list);
        }

        public async Task<AddressBookDto> GetAsync(Guid id)
        {
            var entity = await AddressBookRepository.FindAsync(id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<AddressBook, AddressBookDto>(entity);
        }

        [AddressBookResource]
        public async Task CreateAsync(CreateInput input)
        {
            var addressBook = new AddressBook(GuidGenerator.Create(), CurrentTenant.Id.Value);
            addressBook.Name = input.Name;
            addressBook.Contact = input.Contact;
            addressBook.ContactNumber = input.ContactNumber;
            addressBook.Province = input.Province;
            addressBook.City = input.City;
            addressBook.Town = input.Town;
            addressBook.Street = input.Street;
            addressBook.AddressDetail = input.AddressDetail;
            addressBook.Postcode = input.Postcode;

            await AddressBookRepository.InsertAsync(addressBook);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var addressBook = await AddressBookRepository.FirstOrDefaultAsync(e => e.Id == id);
            if (addressBook == null)
            {
                throw new EntityNotFoundException();
            }

            addressBook.Name = input.Name;
            addressBook.Contact = input.Contact;
            addressBook.ContactNumber = input.ContactNumber;
            addressBook.Province = input.Province;
            addressBook.City = input.City;
            addressBook.Town = input.Town;
            addressBook.Street = input.Street;
            addressBook.AddressDetail = input.AddressDetail;
            addressBook.Postcode = input.Postcode;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await AddressBookRepository.DeleteAsync(e => e.Id == id);
        }
    }
}
