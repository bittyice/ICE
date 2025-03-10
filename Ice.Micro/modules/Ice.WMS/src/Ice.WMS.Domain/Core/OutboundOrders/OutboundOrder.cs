using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;
using System.Linq;
using Volo.Abp.Domain.Entities;

namespace Ice.WMS.Core.OutboundOrders
{
    public class OutboundOrder : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        protected OutboundOrder() { }

        public OutboundOrder(Guid id, string outboundNumber, string type, Guid warehouseId, Guid? tenantId)
        {
            Id = id;
            OutboundNumber = outboundNumber;
            OrderType = type;
            Status = OutboundOrderStatus.ToBePicked;
            WarehouseId = warehouseId;
            TenantId = tenantId;

            OutboundDetails = new List<OutboundDetail>();
        }

        /// <summary>
        /// 去拣货
        /// </summary>
        public void ToPicking(Guid? pickListId) {
            if (Status != OutboundOrderStatus.ToBePicked) {
                throw new UserFriendlyException(message: $"订单{OutboundNumber}状态不是待拣货");
            }

            Status = OutboundOrderStatus.Picking;
            PickListId = pickListId;
        }

        /// <summary>
        /// 分拣
        /// </summary>
        public void Pick(string sku, int sortingQuantity) {
            if (Status != OutboundOrderStatus.Picking)
            {
                throw new UserFriendlyException(message: $"订单{OutboundNumber}状态不是拣货中");
            }

            var outboundDetail = OutboundDetails.FirstOrDefault(e => e.Sku == sku);
            if (outboundDetail == null) {
                throw new UserFriendlyException(message: $"订单{OutboundNumber}不包含SKU {sku}项");
            }

            outboundDetail.Pick(sortingQuantity);
        }

        /// <summary>
        /// 待出库
        /// </summary>
        public void ToTobeOut() {
            if (Status == OutboundOrderStatus.TobeOut) {
                return;
            }

            if (Status != OutboundOrderStatus.Picking)
            {
                throw new UserFriendlyException(message: $"订单{OutboundNumber}状态不是拣货中");
            }

            Status = OutboundOrderStatus.TobeOut;
        }

        /// <summary>
        /// 审查
        /// </summary>
        /// <exception cref="UserFriendlyException"></exception>
        public void Review() {
            if (Status != OutboundOrderStatus.TobeOut)
            {
                throw new UserFriendlyException(message: $"订单{OutboundNumber}状态不是待出库");
            }

            Reviewed = true;
        }

        /// <summary>
        /// 已出库
        /// </summary>
        public void ToOutofstock() {
            if (Status == OutboundOrderStatus.Outofstock) {
                return;
            }

            if (Status != OutboundOrderStatus.TobeOut)
            {
                throw new UserFriendlyException(message: $"订单{OutboundNumber}状态不是待出库");
            }

            Status = OutboundOrderStatus.Outofstock;
            FinishTime = DateTime.Now;
        }

        /// <summary>
        /// 清理出库明细
        /// </summary>
        public void ClearOutboundDetail() {
            if (Status != OutboundOrderStatus.ToBePicked) {
                throw new UserFriendlyException(message: $"订单{OutboundNumber}状态不是待拣货");
            }

            OutboundDetails = new List<OutboundDetail>();
        }

        /// <summary>
        /// 作废
        /// </summary>
        /// <exception cref="UserFriendlyException"></exception>
        public void Invalid() {
            if (OrderType != OutboundOrderType.Transfer && OrderType != OutboundOrderType.Customize) {
                throw new UserFriendlyException(message: $"只能作废调拨和自定义类型的订单");
            }

            if (Status != OutboundOrderStatus.ToBePicked)
            {
                throw new UserFriendlyException(message: $"订单{OutboundNumber}状态不是待拣货状态，无法进行作废");
            }

            Status = OutboundOrderStatus.Invalid;
        }

        /// <summary>
        /// 出库单号
        /// </summary>
        public string OutboundNumber { get; protected set; }

        /// <summary>
        /// 收件人
        /// </summary>
        public string RecvContact { get; set; }

        /// <summary>
        /// 收件人电话
        /// </summary>
        public string RecvContactNumber { get; set; }

        /// <summary>
        /// 省份
        /// </summary>
        public string RecvProvince { get; set; }

        /// <summary>
        /// 市
        /// </summary>
        public string RecvCity { get; set; }

        /// <summary>
        /// 区/县
        /// </summary>
        public string RecvTown { get; set; }

        /// <summary>
        /// 街道
        /// </summary>
        public string RecvStreet { get; set; }

        /// <summary>
        /// 详细地址
        /// </summary>
        public string RecvAddressDetail { get; set; }

        /// <summary>
        /// 邮编
        /// </summary>
        public string RecvPostcode { get; set; }

        /// <summary>
        /// 状态
        /// </summary>
        public OutboundOrderStatus Status { get; protected set; }

        /// <summary>
        /// 复核
        /// </summary>
        public bool Reviewed { get; protected set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public Guid WarehouseId { get; protected set; }

        /// <summary>
        /// 订单类型
        /// </summary>
        /// <see cref="Ice.WMS.Core.OutboundOrderType"/>
        public string OrderType { get; protected set; }

        /// <summary>
        /// 完成时间
        /// </summary>
        public DateTime? FinishTime { get; protected set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }

        /// <summary>
        /// 扩展信息（仅供前端使用）
        /// </summary>
        public string ExtraInfo { get; set; }

        /// <summary>
        /// 其他信息
        /// </summary>
        public string OtherInfo { get; set; }

        /// <summary>
        /// 拣货单ID
        /// </summary>
        public Guid? PickListId { get; protected set; }

        /// <summary>
        /// 是否已推送至TMS
        /// </summary>
        public bool IsPushTMS { get; set; }

        public Guid? TenantId { get; protected set; }

        public ICollection<OutboundDetail> OutboundDetails { get; protected set; }
    }
}
