using Ice.PSI.Core.Contracts;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.PSI.Filters.MaxResources
{
    public class ContractResourceAttribute : MaxResourceAttribute
    {
        protected override int MaxResourceNum => 5000;

        protected override async Task<int> GetCurrentResourceNum(IServiceProvider serviceProvider) => (int)await serviceProvider.GetService<IRepository<Contract>>().GetCountAsync();
    }
}
