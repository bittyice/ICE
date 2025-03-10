using Ice.WMS.Core.Locations;
using Ice.WMS.Core.TransferSkus;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Guids;

namespace Ice.WMS.Core
{
    /// <summary>
    /// 移库管理
    /// </summary>
    public class TransferManager : IDomainService
    {
        protected IRepository<TransferSku, Guid> TransferSkuRepository { get; }

        protected LocationManager LocationManager { get; }

        protected IGuidGenerator GuidGenerator { get; }

        public TransferManager(
            IRepository<TransferSku, Guid> transferSkuRepository,
            LocationManager locationManager,
            IGuidGenerator guidGenerator) 
        {
            TransferSkuRepository = transferSkuRepository;
            LocationManager = locationManager;
            GuidGenerator = guidGenerator;
        }

        public async Task OffShelf(Guid warehouseId, string locationCode, string sku, int quantity) {
            var info = await LocationManager.OffShelf(warehouseId, locationCode, sku, quantity, null);
            var exitTransferSku = await TransferSkuRepository.FirstOrDefaultAsync(e => e.WarehouseId == warehouseId && e.Sku == sku && e.InboundBatch == info.InboundBatch && e.ShelfLise == info.ShelfLise);
            if (exitTransferSku != null) {
                exitTransferSku.Quantity = exitTransferSku.Quantity + quantity;
                return;
            }

            await TransferSkuRepository.InsertAsync(new TransferSku(GuidGenerator.Create(), sku, info.InboundBatch, quantity, info.ShelfLise, warehouseId));
        }

        public async Task OnShelf(Guid transferSkuId, Guid warehouseId, string locationCode, int quantity, bool enforce) {
            var transferSku = await TransferSkuRepository.FindAsync(transferSkuId);
            if (transferSku == null) {
                throw new EntityNotFoundException();
            }

            if (quantity > transferSku.Quantity) {
                throw new UserFriendlyException(message: "上架数量已超出下架数量，请重新输入数量");
            }

            await LocationManager.OnShelf(warehouseId, locationCode, new OnOffShelfSkuInfo(transferSku.Sku, quantity, transferSku.InboundBatch, transferSku.ShelfLise), enforce, null);

            transferSku.Quantity = transferSku.Quantity - quantity;
            if (transferSku.Quantity == 0) {
                await TransferSkuRepository.DeleteAsync(transferSku);
            }
        }
    }
}
