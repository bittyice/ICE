using Ice.Base.Core.ProductInfos;
using Ice.Base.Dtos;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Volo.Abp;
using Microsoft.AspNetCore.Mvc;
using Ice.Utils;
using Ice.Base.Filters.MaxResources;

namespace Ice.Base.Services.ProductInfos
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.BaseScope)]
    public class ProductInfoAppService : BaseAppService
    {
        protected IRepository<ProductInfo, Guid> ProductInfoRepository { get; }

        protected ProductInfoManager ProductInfoManager { get; }

        public ProductInfoAppService(
            IRepository<ProductInfo, Guid> productInfoRepository,
            ProductInfoManager productInfoManager
        )
        {
            ProductInfoRepository = productInfoRepository;
            ProductInfoManager = productInfoManager;
        }

        [ActionName("all")]
        [HttpGet]
        public async Task<List<GetAllOutputItem>> GetAllAsync()
        {
            var query = (await ProductInfoRepository.GetQueryableAsync());
            var list = query.Select(e => new GetAllOutputItem()
            {
                Sku = e.Sku,
                Name = e.Name,
                Unit = e.Unit
            }).ToList();

            return list;
        }

        public async Task<PagedResultDto<ProductInfoDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(ProductInfo.Sku)
                && sorting != nameof(ProductInfo.Name)
                )
            {
                sorting = nameof(ProductInfo.Sku);
            }

            IQueryable<ProductInfo> queryable = await ProductInfoRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (input.ClassifyId != null)
            {
                queryable = queryable.Where(e => e.ClassifyId == input.ClassifyId);
            }

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            if (!string.IsNullOrWhiteSpace(input.Name))
            {
                queryable = queryable.Where(e => e.Name.Contains(input.Name));
            }

            long count = queryable.Count();
            List<ProductInfo> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<ProductInfoDto>(
                count,
                ObjectMapper.Map<List<ProductInfo>, List<ProductInfoDto>>(list)
            );
        }

        public async Task<List<ProductInfoDto>> GetListForSkusAsync(GetListForSkusInput input)
        {
            var query = (await ProductInfoRepository.GetQueryableAsync()).Where(e => input.Skus.Contains(e.Sku));
            var list = query.ToList();
            return ObjectMapper.Map<List<ProductInfo>, List<ProductInfoDto>>(list);
        }

        public async Task<List<ProductInfoDto>> GetListForNamesAsync(GetListForNamesInput input)
        {
            var query = (await ProductInfoRepository.GetQueryableAsync()).Where(e => input.Names.Contains(e.Name));
            var list = query.ToList();
            return ObjectMapper.Map<List<ProductInfo>, List<ProductInfoDto>>(list);
        }

        public async Task<ProductInfoDto> GetAsync(Guid id)
        {
            var entity = (await ProductInfoRepository.WithDetailsAsync(e => e.UnboxProducts)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<ProductInfo, ProductInfoDto>(entity);
        }

        public async Task<ProductInfoDto> GetWithDetailsForSkuAsync(GetWithDetailsForSkuInput input)
        {
            var entity = (await ProductInfoRepository.WithDetailsAsync(e => e.UnboxProducts)).FirstOrDefault(e => e.Sku == input.Sku);
            if (entity == null)
            {
                throw new UserFriendlyException("无效的SKU");
            }

            return ObjectMapper.Map<ProductInfo, ProductInfoDto>(entity);
        }

        [ProductInfoResource]
        public async Task CreateAsync(CreateInput input)
        {
            var productInfo = new ProductInfo(GuidGenerator.Create(), input.Sku, input.Name, CurrentTenant.Id.Value);
            productInfo.Name = input.Name;
            productInfo.Price = input.Price ?? 0;
            productInfo.Unit = input.Unit;
            productInfo.Volume = input.Volume == null ? 0 : input.Volume.Value;
            productInfo.VolumeUnit = input.VolumeUnit;
            productInfo.Weight = input.Weight == null ? 0 : input.Weight.Value;
            productInfo.WeightUnit = input.WeightUnit;
            productInfo.Specification = input.Specification;
            productInfo.Remark = input.Remark;
            productInfo.ExtraInfo = input.ExtraInfo;
            productInfo.ClassifyId = input.ClassifyId;
            productInfo.Brand = input.Brand;
            if (input.UnboxProducts != null)
            {
                foreach (var item in input.UnboxProducts)
                {
                    productInfo.UnboxProducts.Add(new UnboxProduct(GuidGenerator.Create(), item.Sku, item.Quantity));
                }
            }

            await ProductInfoManager.CreateAsync(productInfo);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var productInfo = (await ProductInfoRepository.WithDetailsAsync(e => e.UnboxProducts)).FirstOrDefault(e => e.Id == id);
            if (productInfo == null)
            {
                throw new EntityNotFoundException();
            }

            productInfo.Name = input.Name;
            productInfo.Price = input.Price ?? 0;
            productInfo.Unit = input.Unit;
            productInfo.Volume = input.Volume == null ? 0 : input.Volume.Value;
            productInfo.VolumeUnit = input.VolumeUnit;
            productInfo.Weight = input.Weight == null ? 0 : input.Weight.Value;
            productInfo.WeightUnit = input.WeightUnit;
            productInfo.Specification = input.Specification;
            productInfo.Remark = input.Remark;
            productInfo.ExtraInfo = input.ExtraInfo;
            productInfo.ClassifyId = input.ClassifyId;
            productInfo.Brand = input.Brand;
            productInfo.UnboxProducts = new List<UnboxProduct>();
            if (input.UnboxProducts != null)
            {
                foreach (var item in input.UnboxProducts)
                {
                    productInfo.UnboxProducts.Add(new UnboxProduct(GuidGenerator.Create(), item.Sku, item.Quantity));
                }
            }

            await ProductInfoManager.UpdateAsync(productInfo);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var productInfo = await ProductInfoRepository.FirstOrDefaultAsync(e => e.Id == id);
            if (productInfo == null)
            {
                throw new EntityNotFoundException();
            }

            await ProductInfoRepository.DeleteAsync(productInfo);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
