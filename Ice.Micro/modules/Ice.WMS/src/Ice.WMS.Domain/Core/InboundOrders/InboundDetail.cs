using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.InboundOrders
{
    public class InboundDetail : Entity<Guid>, IMultiTenant
    {
        protected InboundDetail() { }

        public InboundDetail(Guid id, string sku, int forecastQuantity, decimal totalAmount, Guid tenantId)
        {
            Id = id;
            Sku = sku;
            ForecastQuantity = forecastQuantity;
            TotalAmount = totalAmount;
            TenantId = tenantId;
        }


        /// <summary>
        /// 查验
        /// </summary>
        /// <param name="actualQuantity"></param>
        public void Check(
            DateTime? shelfLise,
            int actualQuantity)
        {
            ShelfLise = shelfLise;
            ActualQuantity = actualQuantity;
        }

        /// <summary>
        /// 是否通过查验
        /// </summary>
        /// <returns></returns>
        public bool IsCheckPass() {
            return ForecastQuantity == ActualQuantity;
        }

        /// <summary>
        /// 上架
        /// </summary>
        /// <param name="shelvesQuantity"></param>
        public void OnShelf(int shelvesQuantity) { 
            ShelvesQuantity = ShelvesQuantity + shelvesQuantity;
        }

        /// <summary>
        /// 是否完成上架
        /// </summary>
        /// <returns></returns>
        public bool IsOnShelfPass() {
            return ActualQuantity == ShelvesQuantity;
        }

        /// <summary>
        /// SKU
        /// </summary>
        public string Sku { get; protected set; }

        /// <summary>
        /// 预报数量
        /// </summary>
        public int ForecastQuantity { get; protected set; }

        /// <summary>
        /// 实际数量
        /// </summary>
        public int ActualQuantity { get; protected set; }

        /// <summary>
        /// 上架数量
        /// </summary>
        public int ShelvesQuantity { get; protected set; }

        /// <summary>
        /// 过期时间
        /// </summary>
        public DateTime? ShelfLise { get; set; }

        /// <summary>
        /// 备注，简单的说明，如5托
        /// </summary>
        public string Remark { get; set; }

        /// <summary>
        /// 商品总金额
        /// </summary>
        public decimal TotalAmount { get; protected set; }

        public Guid InboundOrderId { get; protected set; }

        public Guid? TenantId { get; protected set; }
    }
}
