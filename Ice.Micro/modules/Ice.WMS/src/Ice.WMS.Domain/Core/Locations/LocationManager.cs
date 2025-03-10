using Ice.WMS.Core.StockChangeLogs;
using Ice.WMS.Repositorys;
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
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.Locations
{
    public class LocationManager : IDomainService
    {
        protected IRepository<Location, Guid> LocationRepository { get; }

        protected IRepository<StockChangeLog, Guid> StockChangeLogRepository { get; }

        protected ILocationDetailRepository LocationDetailRepository { get; }

        protected ICurrentTenant CurrentTenant { get; }

        protected IGuidGenerator GuidGenerator { get; }

        public LocationManager(
            IRepository<Location, Guid> locationRepository,
            IRepository<StockChangeLog, Guid> stockChangeLogRepository,
            ILocationDetailRepository locationDetailRepository,
            ICurrentTenant currentTenant,
            IGuidGenerator guidGenerator
            ) {
            LocationRepository = locationRepository;
            StockChangeLogRepository = stockChangeLogRepository;
            LocationDetailRepository = locationDetailRepository;
            CurrentTenant = currentTenant;
            GuidGenerator = guidGenerator;
        }

        /// <summary>
        /// 创建
        /// </summary>
        /// <param name="location"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task CreateAsync(Location location) {
            if (await LocationRepository.AnyAsync(e => e.Code == location.Code && e.WarehouseId == location.WarehouseId)) {
                throw new UserFriendlyException(message: "库位编码已存在");
            }

            await LocationRepository.InsertAsync(location);
        }

        /// <summary>
        /// 设置经常使用
        /// </summary>
        /// <param name="location"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task SetOften(Location location, bool often) {
            if (often == false) {
                location.Often = false;
                return;
            }

            if (await LocationRepository.CountAsync(e => e.Often && e.WarehouseId == location.WarehouseId) >= 30)
            {
                throw new UserFriendlyException(message: "最多只能设置30个经常使用的库位");
            }

            location.Often = true;
        }

        /// <summary>
        /// 上架
        /// </summary>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task OnShelf(
            Guid warehouseId,
            string locationCode,
            OnOffShelfSkuInfo onOffShelfSkuInfo,
            bool enforce,
            Guid? relationId) 
        {
            var location = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == locationCode && e.WarehouseId == warehouseId);
            if (location == null)
            {
                throw new UserFriendlyException(message: "上架失败，无效的库位编码");
            }

            await OnShelf(location, onOffShelfSkuInfo, enforce, relationId);
        }

        /// <summary>
        /// 上架
        /// </summary>
        /// <param name="location"></param>
        /// <param name="onOffShelfSkuInfo"></param>
        /// <param name="enforce"></param>
        /// <param name="relationId"></param>
        /// <returns></returns>
        public async Task OnShelf(
            Location location,
            OnOffShelfSkuInfo onOffShelfSkuInfo,
            bool enforce,
            Guid? relationId)
        {
            if (onOffShelfSkuInfo.Quantity <= 0) {
                return;
            }
            location.OnShelf(onOffShelfSkuInfo, GuidGenerator, enforce);
            await StockChangeLogRepository.InsertAsync(new StockChangeLog()
            {
                Sku = onOffShelfSkuInfo.Sku,
                Location = location.Code,
                Quantity = onOffShelfSkuInfo.Quantity,
                WarehouseId = location.WarehouseId,
                RelationId = relationId,
                CreationTime = DateTime.Now,
            });
        }

        /// <summary>
        /// 批量上架
        /// </summary>
        /// <param name="warehouseId"></param>
        /// <param name="locationCode"></param>
        /// <param name="onOffShelfSkuInfos"></param>
        /// <param name="enforce"></param>
        /// <param name="relationId"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task OnShelfBatch(
            Guid warehouseId,
            string locationCode,
            IEnumerable<OnOffShelfSkuInfo> onOffShelfSkuInfos,
            bool enforce,
            Guid? relationId) 
        {
            var location = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == locationCode && e.WarehouseId == warehouseId);
            if (location == null)
            {
                throw new UserFriendlyException(message: "上架失败，无效的库位编码");
            }

            foreach (var item in onOffShelfSkuInfos) {
                await OnShelf(location, item, enforce, relationId);
            }
        }

        /// <summary>
        /// 下架
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task<OnOffShelfSkuInfo> OffShelf(
            Guid warehouseId,
            string locationCode,
            string sku,
            int quantity,
            Guid? relationId)
        {
            var location = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == locationCode && e.WarehouseId == warehouseId);
            if (location == null)
            {
                throw new UserFriendlyException(message: "下架失败，无效的库位编码");
            }

            return await OffShelf(location, sku, quantity, relationId);
        }

        /// <summary>
        /// 下架
        /// </summary>
        /// <param name="location"></param>
        /// <param name="sku"></param>
        /// <param name="quantity"></param>
        /// <param name="relationId"></param>
        /// <returns></returns>
        public async Task<OnOffShelfSkuInfo> OffShelf(
            Location location,
            string sku,
            int quantity,
            Guid? relationId)
        {
            var info = location.OffShelf(sku, quantity);
            await StockChangeLogRepository.InsertAsync(new StockChangeLog()
            {
                Sku = sku,
                Location = location.Code,
                Quantity = -quantity,
                WarehouseId = location.WarehouseId,
                RelationId = relationId,
                CreationTime = DateTime.Now,
            });
            return info;
        }

        /// <summary>
        /// 盘点
        /// </summary>
        /// <param name="warehouseId"></param>
        /// <param name="locationCode"></param>
        /// <param name="sku"></param>
        /// <param name="inboundBatch"></param>
        /// <param name="quantity"></param>
        /// <param name="shelfLise"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task Check(
            Guid warehouseId,
            string locationCode,
            OnOffShelfSkuInfo onOffShelfSkuInfo,
            Guid? relationId)
        {
            var location = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == locationCode && e.WarehouseId == warehouseId);
            if (location == null)
            {
                throw new UserFriendlyException(message: "盘点失败，无效的库位编码");
            }

            int changeQuantity = location.Check(onOffShelfSkuInfo, GuidGenerator);
            await StockChangeLogRepository.InsertAsync(new StockChangeLog()
            {
                Sku = onOffShelfSkuInfo.Sku,
                Location = locationCode,
                Quantity = changeQuantity,
                WarehouseId = location.WarehouseId,
                RelationId = relationId,
                CreationTime = DateTime.Now,
            });
        }

        /// <summary>
        /// 冻结
        /// </summary>
        /// <param name="warehouseId"></param>
        /// <param name="locationCode"></param>
        /// <param name="sku"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task Freeze(Guid warehouseId, string locationCode, string sku) {
            var location = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == locationCode && e.WarehouseId == warehouseId);
            if (location == null)
            {
                throw new UserFriendlyException(message: "冻结失败，无效的库位编码");
            }

            location.Freeze(sku);
        }

        /// <summary>
        /// 解冻
        /// </summary>
        /// <param name="warehouseId"></param>
        /// <param name="locationCode"></param>
        /// <param name="sku"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task Unfreeze(Guid warehouseId, string locationCode, string sku) {
            var location = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == locationCode && e.WarehouseId == warehouseId);
            if (location == null)
            {
                throw new UserFriendlyException(message: "解冻失败，无效的库位编码");
            }

            location.Unfreeze(sku);
        }

        /// <summary>
        /// 批次号冻结
        /// </summary>
        /// <returns></returns>
        public async Task FreezeForInboundBatch(Guid warehouseId, string inboundBatch) {
            await LocationDetailRepository.SetIsFreezeForInboundBatch(CurrentTenant.Id.Value, warehouseId, inboundBatch, true);
        }

        /// <summary>
        /// 批次号解冻
        /// </summary>
        /// <param name="warehouseId"></param>
        /// <param name="inboundBatch"></param>
        /// <returns></returns>
        public async Task UnfreezeForInboundBatch(Guid warehouseId, string inboundBatch) {
            await LocationDetailRepository.SetIsFreezeForInboundBatch(CurrentTenant.Id.Value, warehouseId, inboundBatch, false);
        }

        /// <summary>
        /// 拆箱
        /// </summary>
        /// <returns></returns>
        public async Task Unboxing(
            Guid warehouseId,
            string offshelfLocationCode, 
            UnboxingProduct offshelfProduct, 
            string onshelfLocationCode, 
            List<UnboxingProduct> onshelfProducts) 
        {
            var offshelfLocation = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == offshelfLocationCode && e.WarehouseId == warehouseId);
            if (offshelfLocation == null)
            {
                throw new UserFriendlyException(message: "下架失败，无效的库位编码");
            }
            var offshelfProductInfo = await OffShelf((Location)offshelfLocation, offshelfProduct.Sku, offshelfProduct.Quantity, null);

            var onsholfLocation = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == onshelfLocationCode && e.WarehouseId == warehouseId);
            if (onsholfLocation == null)
            {
                throw new UserFriendlyException(message: "上架失败，无效的库位编码");
            }

            foreach (var item in onshelfProducts) {
                await OnShelf(onsholfLocation, new OnOffShelfSkuInfo(item.Sku, item.Quantity, offshelfProductInfo.InboundBatch, offshelfProductInfo.ShelfLise), true, null);
            }
        }

        /// <summary>
        /// 删除库位
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task DeleteAsync(Guid id) {
            if (await LocationDetailRepository.AnyAsync(e => e.LocationId == id)) {
                throw new UserFriendlyException("无法删除库位，请先清空该库位下的库存后再删除");
            }

            await LocationRepository.DeleteAsync(id);
        }
    }
}
