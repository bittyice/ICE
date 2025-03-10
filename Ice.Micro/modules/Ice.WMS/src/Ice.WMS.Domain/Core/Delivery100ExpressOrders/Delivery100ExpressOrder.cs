using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Values;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core.Delivery100ExpressOrders
{
    public class Delivery100ExpressOrder : AggregateRoot<Guid>, IHasCreationTime, IMultiTenant
    {
        /// <summary>
        /// 快递公司编码
        /// </summary>
        public string ShipperCode { get; set; }

        /// <summary>
        /// 快递单号
        /// </summary>
        public string ExpressNumber { get; set; }

        /// <summary>
        /// 快递公司订单号
        /// </summary>
        public string ShipperOrderNumber { get; set; }

        /// <summary>
        /// 订单号
        /// </summary>
        public string OrderNumber { get; set; }

        /// <summary>
        /// 打印模板
        /// </summary>
        public string PrintTemplate { get; set; }

        /// <summary>
        /// 是否已取消
        /// </summary>
        public bool IsCancel { get; set; }

        /// <summary>
        /// 第三方信息（json 结构）
        /// </summary>
        public string TPInfo { get; set; }

        public DateTime CreationTime { get; protected set; }

        public Guid? TenantId { get; protected set; }

        public Delivery100ExpressOrder(Guid id)
        {
            Id = id;
            CreationTime = DateTime.UtcNow;
        }
    }
}
