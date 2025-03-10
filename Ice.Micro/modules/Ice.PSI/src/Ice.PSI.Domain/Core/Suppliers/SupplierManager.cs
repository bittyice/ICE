using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.PSI.Core.Suppliers
{
    public class SupplierManager : IDomainService
    {
        protected IRepository<Supplier, Guid> SupplierRepository { get; set; }

        public SupplierManager(IRepository<Supplier, Guid> supplierRepository) { 
            SupplierRepository = supplierRepository;
        }

        public async Task CreateAsync(Supplier supplier) {
            if (await SupplierRepository.AnyAsync(e => e.Code == supplier.Code)) {
                throw new UserFriendlyException(message: "供应商编码已存在");
            }

            await SupplierRepository.InsertAsync(supplier);
        }

        public async Task DeleteAsync(Guid id) {
            await SupplierRepository.DeleteAsync(id);
        }
    }
}
