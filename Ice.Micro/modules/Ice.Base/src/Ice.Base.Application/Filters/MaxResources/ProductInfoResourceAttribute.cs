using Ice.Base.Core.ProductInfos;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.Base.Filters.MaxResources
{
    public class ProductInfoResourceAttribute : MaxResourceAttribute
    {
        protected override int MaxResourceNum => 2000;

        protected override async Task<int> GetCurrentResourceNum(IServiceProvider serviceProvider) => (int)await serviceProvider.GetService<IRepository<ProductInfo>>().GetCountAsync();
    }
}
