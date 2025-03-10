using Ice.Base.Core.Addresss;
using Ice.Utils;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.Base.Filters.MaxResources
{
    public class AddressBookResourceAttribute : MaxResourceAttribute
    {
        protected override int MaxResourceNum => 2000;

        protected override async Task<int> GetCurrentResourceNum(IServiceProvider serviceProvider) => (int)await serviceProvider.GetService<IRepository<AddressBook>>().GetCountAsync();
    }
}
