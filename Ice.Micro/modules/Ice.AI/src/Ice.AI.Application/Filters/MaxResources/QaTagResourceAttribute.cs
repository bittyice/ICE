using Ice.AI.Core;
using Ice.Utils;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.AI.Filters.MaxResources
{
    public class QaTagsResourceAttribute : MaxResourceAttribute
    {
        protected override int MaxResourceNum => Consts.PageSizeLength;

        protected override async Task<int> GetCurrentResourceNum(IServiceProvider serviceProvider) => (int)await serviceProvider.GetService<IRepository<QaTag>>().GetCountAsync();
    }
}
