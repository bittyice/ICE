using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.OutboundOrders
{
    public class OutboundDetail : Entity<Guid>, IMultiTenant
    {
        protected OutboundDetail() { }

        public OutboundDetail(Guid id, string sku, int quantity, decimal totalAmount, Guid tenantId)
        {
            Id = id;
            Sku = sku;
            Quantity = quantity;
            TotalAmount = totalAmount;
            TenantId = tenantId;
        }

        /// <summary>
        /// 分拣
        /// </summary>
        /// <param name="sortingQuantity"></param>
        /// <exception cref="UserFriendlyException"></exception>
        public void Pick(int sortingQuantity) {
            var newSortedQuantity = SortedQuantity + sortingQuantity;
            if (newSortedQuantity > Quantity) {
                throw new UserFriendlyException(message: $"已超出计划的分拣数量，请重新输入分拣数量");
            }
            SortedQuantity = newSortedQuantity;
        }

        public string Sku { get; protected set; }

        /// <summary>
        /// 订单数量
        /// </summary>
        public int Quantity { get; protected set; }

        /// <summary>
        /// 已拣货数量
        /// </summary>
        public int SortedQuantity { get; protected set; }

        /// <summary>
        /// 商品总金额
        /// </summary>
        public decimal TotalAmount { get; protected set; }

        public Guid OutboundOrderId { get; protected set; }

        public Guid? TenantId { get; protected set; }
    }
}
