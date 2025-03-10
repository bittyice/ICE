using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.SaleOrders
{
    /// <summary>
    /// 补货单
    /// </summary>
    public class SaleOrder : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// 单号
        /// </summary>
        public string OrderNumber { get; protected set; }

        /// <summary>
        /// 下单时价格
        /// </summary>
        public decimal PlaceTotalPrice { get; set; }

        /// <summary>
        /// 应支付金额
        /// </summary>
        public decimal TotalPrice { get; protected set; }

        /// <summary>
        /// 已支付总价
        /// </summary>
        public decimal TotalPricePaid { get; protected set; }

        /// <summary>
        /// 收货时间
        /// </summary>
        public DateTime? FinishDate { get; protected set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 驳回原因
        /// </summary>
        public string? RejectReason { get; set; }

        /// <summary>
        /// 扩展信息（仅供前端使用）
        /// </summary>
        public string? ExtraInfo { get; set; }

        /// <summary>
        /// 状态
        /// </summary>
        /// <see cref="SaleOrderStatus"/>
        public string Status { get; protected set; }

        /// <summary>
        /// 是否结算
        /// </summary>
        public bool IsSettlement { get; protected set; }

        /// <summary>
        /// 销售员
        /// </summary>
        public string? Seller { get; set; }

        /// <summary>
        /// 租户
        /// </summary>
        public Guid? TenantId { get; protected set; }

        /// <summary>
        /// 收货地址（即货物发送到的门店地址）
        /// </summary>
        public RecvInfo RecvInfo { get; protected set; }

        /// <summary>
        /// 支付方式
        /// </summary>
        public Guid? PaymentMethodId { get; set; }

        /// <summary>
        /// 补货明细
        /// </summary>
        public ICollection<SaleDetail> Details { get; protected set; }

        protected SaleOrder() { }

        public SaleOrder(Guid id, string orderNumber, Guid tenantId, RecvInfo recvInfo)
        {
            Id = id;
            OrderNumber = orderNumber;
            Details = new List<SaleDetail>();
            Status = SaleOrderStatus.WaitConfirm;
            TenantId = tenantId;
            RecvInfo = recvInfo;
        }

        public void SetRecvInfo(RecvInfo recvInfo)
        {
            if (Status != SaleOrderStatus.WaitConfirm)
            {
                throw new UserFriendlyException(message: $"操作失败，订单状态不是待确认");
            }

            RecvInfo = recvInfo;
        }

        /// <summary>
        /// 添加入库明细
        /// </summary>
        /// <param name="sku"></param>
        /// <param name="name"></param>
        /// <param name="forecastQuantity"></param>
        /// <param name="tenantId"></param>
        /// <param name="guidGenerator"></param>
        public void AddInboundDetail(SaleDetail inboundDetail)
        {
            if (Status != SaleOrderStatus.WaitConfirm)
            {
                throw new UserFriendlyException(message: $"操作失败，订单状态不是待确认");
            }

            if (Details.Any(e => e.Sku == inboundDetail.Sku))
            {
                throw new UserFriendlyException(message: $"操作失败，SKU已重复");
            }

            Details.Add(inboundDetail);
        }

        /// <summary>
        /// 清理入库单
        /// </summary>
        /// <exception cref="UserFriendlyException"></exception>
        public void ClearDetail()
        {
            if (Status != SaleOrderStatus.WaitConfirm)
            {
                throw new UserFriendlyException(message: $"订单状态不是待确认");
            }

            Details = new List<SaleDetail>();
        }

        /// <summary>
        /// 确认
        /// </summary>
        public void Confirm(decimal totalPrice)
        {
            if (Status != SaleOrderStatus.WaitConfirm)
            {
                throw new UserFriendlyException(message: "确认失败，订单不是待确认状态");
            }

            Status = SaleOrderStatus.ToBeProcessed;
            TotalPrice = totalPrice;
        }

        /// <summary>
        /// 取消确认
        /// </summary>
        /// <exception cref="UserFriendlyException"></exception>
        public void Unconfirm()
        {
            if (Status != SaleOrderStatus.ToBeProcessed)
            {
                throw new UserFriendlyException(message: "取消确认失败，订单不是待处理状态");
            }

            Status = SaleOrderStatus.WaitConfirm;
            TotalPrice = 0;
        }

        /// <summary>
        /// 拒绝
        /// </summary>
        /// <param name="rejectReason"></param>
        public void Reject(string rejectReason)
        {
            if (Status != SaleOrderStatus.WaitConfirm)
            {
                throw new UserFriendlyException(message: "驳回失败，订单不是待确认状态");
            }

            Status = SaleOrderStatus.Rejected;
            RejectReason = rejectReason;
        }

        /// <summary>
        /// 处理中
        /// </summary>
        public void Processing()
        {
            if (Status == SaleOrderStatus.Processing)
            {
                return;
            }

            if (Status != SaleOrderStatus.ToBeProcessed)
            {
                throw new UserFriendlyException(message: "状态变更失败，订单不是待处理状态");
            }

            Status = SaleOrderStatus.Processing;
        }

        /// <summary>
        /// 已收货
        /// </summary>
        public void Completed()
        {
            if (Status != SaleOrderStatus.Processing)
            {
                throw new UserFriendlyException(message: "状态变更失败，订单不是运输中状态");
            }

            Status = SaleOrderStatus.Completed;
            FinishDate = DateTime.Now;
        }

        /// <summary>
        /// 结算
        /// </summary>
        public void Settlement()
        {
            if (Status != SaleOrderStatus.Completed)
            {
                throw new UserFriendlyException("签收后才能进行结算");
            }

            IsSettlement = true;
        }

        /// <summary>
        /// 设置已支付总价
        /// </summary>
        /// <param name="totalPricePaid"></param>
        /// <exception cref="UserFriendlyException"></exception>
        public void SetTotalPricePaid(decimal totalPricePaid)
        {
            if (Status != SaleOrderStatus.Completed)
            {
                throw new UserFriendlyException("签收后才能设置已支付总价");
            }
            TotalPricePaid = totalPricePaid;
        }
    }

    public class RecvInfo
    {
        /// <summary>
        /// 商户名
        /// </summary>
        public string BusinessName { get; protected set; }

        /// <summary>
        /// 联系人
        /// </summary>
        public string Contact { get; protected set; }

        /// <summary>
        /// 联系电话
        /// </summary>
        public string ContactNumber { get; protected set; }

        /// <summary>
        /// 省份
        /// </summary>
        public string? Province { get; protected set; }

        /// <summary>
        /// 城市
        /// </summary>
        public string? City { get; protected set; }

        /// <summary>
        /// 区
        /// </summary>
        public string? Town { get; protected set; }

        /// <summary>
        /// 街道
        /// </summary>
        public string? Street { get; protected set; }

        /// <summary>
        /// 地址
        /// </summary>
        public string? AddressDetail { get; protected set; }

        /// <summary>
        /// 邮编
        /// </summary>
        public string? Postcode { get; protected set; }

        protected RecvInfo() { }

        public RecvInfo(string businessName, string contact, string contactNumber, string province, string city, string town, string street, string addressDetail, string postcode)
        {
            BusinessName = businessName;
            Contact = contact;
            ContactNumber = contactNumber;
            Province = province;
            City = city;
            Town = town;
            Street = street;
            AddressDetail = addressDetail;
            Postcode = postcode;
        }
    }
}
