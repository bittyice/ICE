using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.PSI.Core.SaleOrders
{
    public class SaleDetail : Entity<Guid>, IMultiTenant
    {
        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; protected set; }

        /// <summary>
        /// 销售数量
        /// </summary>
        public int Quantity { get; protected set; }

        /// <summary>
        /// 赠送数量（有时候买10箱会赠送1箱）
        /// </summary>
        public int GiveQuantity { get; protected set; }

        /// <summary>
        /// 下单时单价
        /// </summary>
        public decimal PlacePrice { get; protected set; }

        public Guid SaleOrderId { get; protected set; }

        public Guid? TenantId { get; protected set; }

        protected SaleDetail() { }

        public SaleDetail(Guid id, string sku, int quantity, int giveQuantity, decimal placePrice)
        {
            Id = id;
            Sku = sku;
            Quantity = quantity;
            GiveQuantity = giveQuantity;
            PlacePrice = placePrice;
        }
    }
}
