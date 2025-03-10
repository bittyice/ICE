using System.Linq;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.Base.Core.ProductInfos
{
    public class ProductInfoManager : IDomainService
    {
        public IRepository<ProductInfo, Guid> ProductInfoRepository { get; set; }

        public ProductInfoManager(
            IRepository<ProductInfo, Guid> productInfoRepository)
        {
            ProductInfoRepository = productInfoRepository;
        }

        public async Task CreateAsync(ProductInfo productInfo)
        {
            if (await ProductInfoRepository.AnyAsync(e => e.Sku == productInfo.Sku || e.Name == productInfo.Name))
            {
                throw new UserFriendlyException(message: "产品已存在，请确保SKU和产品名不出现重复");
            }

            await ProductInfoRepository.InsertAsync(productInfo);
        }

        public async Task UpdateAsync(ProductInfo productInfo)
        {
            if (await ProductInfoRepository.AnyAsync(e => (e.Sku == productInfo.Sku || e.Name == productInfo.Name) && e.Id != productInfo.Id))
            {
                throw new UserFriendlyException(message: "产品已存在，请确保SKU和产品名不出现重复");
            }
        }
    }
}
