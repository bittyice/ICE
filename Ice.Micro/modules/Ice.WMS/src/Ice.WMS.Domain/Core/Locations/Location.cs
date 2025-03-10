using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;
using System.Linq;
using Volo.Abp;
using Volo.Abp.Guids;

namespace Ice.WMS.Core.Locations
{
    public class Location : AggregateRoot<Guid>, IMultiTenant, ISoftDelete
    {
        protected Location() { }

        public Location(Guid id, string code, Guid areaId, Guid warehouseId, Guid tenantId) {
            Id = id;
            AreaId = areaId;
            WarehouseId = warehouseId;
            LocationDetails = new List<LocationDetail>();
            (Code, TenantId) = (code, tenantId);
        }

        /// <summary>
        /// 上架
        /// </summary>
        /// <param name="sku"></param>
        /// <param name="name"></param>
        /// <param name="inboundBatch"></param>
        /// <param name="quantity"></param>
        /// <param name="length"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <param name="weight"></param>
        /// <param name="shelfLise"></param>
        /// <param name="clientId"></param>
        /// <param name="clientName"></param>
        /// <param name="enforce"></param>
        /// <exception cref="UserFriendlyException"></exception>
        public void OnShelf(
            OnOffShelfSkuInfo onOffShelfSkuInfo,
            IGuidGenerator guidGenerator,
            bool enforce = false) 
        {
            var locationDetail = LocationDetails.FirstOrDefault(e => e.Sku == onOffShelfSkuInfo.Sku);
            if (locationDetail == null) {
                var newLocationDetail = new LocationDetail(guidGenerator.Create(), onOffShelfSkuInfo.Sku, string.IsNullOrWhiteSpace(onOffShelfSkuInfo.InboundBatch) ? null : onOffShelfSkuInfo.InboundBatch, TenantId.Value);
                newLocationDetail.Quantity = onOffShelfSkuInfo.Quantity;
                newLocationDetail.ShelfLise = onOffShelfSkuInfo.ShelfLise;

                LocationDetails.Add(newLocationDetail);
                return;
            }

            if (locationDetail.IsFreeze) {
                throw new UserFriendlyException(message: $"上架失败，[{onOffShelfSkuInfo.Sku}] 在当前库位处于冻结状态");
            }

            // 强制上架
            if (enforce) {
                locationDetail.Quantity = locationDetail.Quantity + onOffShelfSkuInfo.Quantity;
                return;
            }

            if (locationDetail.InboundBatch != onOffShelfSkuInfo.InboundBatch)
            {
                throw new UserFriendlyException(message: $"上架失败，当前库位已存在[{onOffShelfSkuInfo.Sku}]，但它与新上架的货物批次号不同");
            }

            if (locationDetail.ShelfLise != onOffShelfSkuInfo.ShelfLise)
            {
                throw new UserFriendlyException(message: $"上架失败，当前库位已存在[{onOffShelfSkuInfo.Sku}]，但它与新上架的货物保质期不同");
            }

            locationDetail.Quantity = locationDetail.Quantity + onOffShelfSkuInfo.Quantity;
        }

        /// <summary>
        /// 下架
        /// </summary>
        /// <param name="sku"></param>
        /// <param name="quantity"></param>
        /// <exception cref="UserFriendlyException"></exception>
        public OnOffShelfSkuInfo OffShelf(string sku, int quantity) {
            var locationDetail = LocationDetails.FirstOrDefault(e => e.Sku == sku);
            if (locationDetail == null) {
                throw new UserFriendlyException(message: $"该库位的 [{sku}] 库存为0，请选择其他库位进行操作");
            }

            if (locationDetail.IsFreeze)
            {
                throw new UserFriendlyException(message: $"下架失败，[{sku}] 在当前库位处于冻结状态");
            }

            if (quantity > locationDetail.Quantity) {
                throw new UserFriendlyException(message: $"下架数量超过库存数量{locationDetail.Quantity}，请重新填写下架数量");
            }

            locationDetail.Quantity = locationDetail.Quantity - quantity;
            if (locationDetail.Quantity == 0) {
                LocationDetails.Remove(locationDetail);
            }

            return new OnOffShelfSkuInfo(locationDetail.Sku, quantity, locationDetail.InboundBatch, locationDetail.ShelfLise);
        }

        /// <summary>
        /// 盘点
        /// </summary>
        /// <param name="sku"></param>
        /// <param name="inboundBatch"></param>
        /// <param name="quantity"></param>
        /// <param name="shelfLise"></param>
        /// <param name="guidGenerator"></param>
        /// <returns>返回库存变化数</returns>
        public int Check(
            OnOffShelfSkuInfo onOffShelfSkuInfo,
            IGuidGenerator guidGenerator) 
        {
            var locationDetail = LocationDetails.FirstOrDefault(e => e.Sku == onOffShelfSkuInfo.Sku);
            int changeQuantity = locationDetail != null ? onOffShelfSkuInfo.Quantity - locationDetail.Quantity : onOffShelfSkuInfo.Quantity;

            if (onOffShelfSkuInfo.Quantity == 0)
            {
                if (locationDetail != null)
                {
                    LocationDetails.Remove(locationDetail);
                }
                return changeQuantity;
            }

            if (locationDetail == null)
            {
                var newLocationDetail = new LocationDetail(guidGenerator.Create(), onOffShelfSkuInfo.Sku, onOffShelfSkuInfo.InboundBatch, TenantId.Value);
                newLocationDetail.Quantity = onOffShelfSkuInfo.Quantity;
                newLocationDetail.ShelfLise = onOffShelfSkuInfo.ShelfLise;

                LocationDetails.Add(newLocationDetail);
                return changeQuantity;
            }

            locationDetail.Check(onOffShelfSkuInfo.InboundBatch, onOffShelfSkuInfo.Quantity, onOffShelfSkuInfo.ShelfLise);
            return changeQuantity;
        }

        /// <summary>
        /// 冻结
        /// </summary>
        public void Freeze(string sku) {
            var locationDetail = LocationDetails.FirstOrDefault(e => e.Sku == sku);
            if (locationDetail == null) {
                throw new UserFriendlyException(message: $"[{sku}]在当前库位没有库存");
            }

            locationDetail.IsFreeze = true;
        }

        /// <summary>
        /// 解冻
        /// </summary>
        public void Unfreeze(string sku) {
            var locationDetail = LocationDetails.FirstOrDefault(e => e.Sku == sku);
            if (locationDetail == null)
            {
                throw new UserFriendlyException(message: $"[{sku}]在当前库位没有库存");
            }

            locationDetail.IsFreeze = false;
        }

        /// <summary>
        /// 库位
        /// </summary>
        public string Code { get; protected set; }

        /// <summary>
        /// 是否经常使用
        /// </summary>
        public bool Often { get; set; }

        public Guid? TenantId { get; protected set; }

        public Guid AreaId { get; protected set; }

        public Guid WarehouseId { get; protected set; }

        public ICollection<LocationDetail> LocationDetails { get; protected set; }

        public bool IsDeleted { get; set; }
    }
}
