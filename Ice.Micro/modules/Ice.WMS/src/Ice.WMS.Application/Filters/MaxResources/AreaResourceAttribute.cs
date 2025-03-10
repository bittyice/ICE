using Ice.WMS.Core.Areas;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.Filters.MaxResources
{
    public class AreaResourceAttribute : MaxResourceAttribute
    {
        protected override int MaxResourceNum => 1000;

        protected override async Task<int> GetCurrentResourceNum(IServiceProvider serviceProvider) => (int)await serviceProvider.GetService<IRepository<Area>>().GetCountAsync();
    }
}
