using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Core.TransferSkus;
using Ice.WMS.Dtos;
using Ice.WMS.Transfers.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.Transfers
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class TransferAppService : WMSAppService
    {
        protected TransferManager TransferManager { get; }

        protected IRepository<TransferSku, Guid> TransferSkuRepository { get; }

        public TransferAppService(
            TransferManager transferManager,
            IRepository<TransferSku, Guid> transferSkuRepository) 
        { 
            TransferManager = transferManager;
            TransferSkuRepository = transferSkuRepository;
        }


        [HttpGet]
        public async Task<PagedResultDto<TransferSkuDto>> GetTransferSkusAsync(GetTransferSkusInput input)
        {
            var sorting = nameof(TransferSku.Sku);

            IQueryable<TransferSku> queryable = await TransferSkuRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            long count = queryable.Count();
            List<TransferSku> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<TransferSkuDto>(
                count,
                ObjectMapper.Map<List<TransferSku>, List<TransferSkuDto>>(list)
            );
        }

        [HttpPut]
        public async Task OffShelfAsync(OffShelfInput input) {
            await TransferManager.OffShelf(input.WarehouseId, input.LocationCode, input.Sku, input.Quantity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpGet]
        public async Task<List<TransferSkuDto>> FindTransferSkusAsync(FindTransferSkusInput input) {
            var transferSkus =(await TransferSkuRepository.GetQueryableAsync()).Where(e => e.WarehouseId == input.WarehouseId && e.Sku == input.Sku).ToList();
            return ObjectMapper.Map<List<TransferSku>, List<TransferSkuDto>>(transferSkus);
        }

        [HttpPut]
        public async Task OnShelfAsync(OnShelfInput input) {
            await TransferManager.OnShelf(input.TransferSkuId, input.WarehouseId, input.LocationCode, input.Quantity, input.Enforce);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
