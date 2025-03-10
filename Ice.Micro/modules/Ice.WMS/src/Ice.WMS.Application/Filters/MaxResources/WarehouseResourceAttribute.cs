using Ice.Utils;
using Ice.WMS.Core.Warehouses;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.Filters.MaxResources
{
    public class WarehouseResourceAttribute : MaxResourceAttribute
    {
        protected override int MaxResourceNum => Consts.PageSizeLength;

        protected override async Task<int> GetCurrentResourceNum(IServiceProvider serviceProvider) => (int)await serviceProvider.GetService<IRepository<Warehouse>>().GetCountAsync();
    }
}
