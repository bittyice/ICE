using Ice.WMS.Core;
using System;
using System.Collections.Generic;
using System.Text;
using Volo.Abp.Application.Dtos;

namespace Ice.WMS.Dtos
{
    public class OutboundOrderDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// 出库单号
        /// </summary>
        public string OutboundNumber { get; set; }

        /// <summary>
        /// 来源
        /// </summary>
        public string OrderType { get; set; }

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
        public OutboundOrderStatus Status { get; set; }

        /// <summary>
        /// 复核
        /// </summary>
        public bool Reviewed { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public Guid WarehouseId { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }

        /// <summary>
        /// 拣货单ID
        /// </summary>
        public Guid? PickListId { get; set; }

        /// <summary>
        /// 扩展信息
        /// </summary>
        public string ExtraInfo { get; set; }

        /// <summary>
        /// 其他信息
        /// </summary>
        public string OtherInfo { get; set; }

        /// <summary>
        /// 是否已推送至TMS
        /// </summary>
        public bool IsPushTMS { get; set; }

        public ICollection<OutboundDetailDto> OutboundDetails { get; set; }

        public DateTimeOffset? FinishTime { get; set; }

        public DateTimeOffset CreationTime { get; set; }
    }
}
