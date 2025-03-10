

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.OutboundOrders;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.Reports;

[Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
public class DetailReportAppService : WMSAppService
{
    protected IRepository<InboundDetail> InboundDetailRepository { get; }

    protected IRepository<InboundOrder> InboundOrderRepository { get; }

    protected IRepository<OutboundDetail> OutboundDetailRepository { get; }

    protected IRepository<OutboundOrder> OutboundOrderRepository { get; }

    public DetailReportAppService(
        IRepository<InboundDetail> inboundDetailRepository,
        IRepository<InboundOrder> inboundOrderRepository,
        IRepository<OutboundDetail> detailRepository,
        IRepository<OutboundOrder> orderRepository)
    {
        InboundDetailRepository = inboundDetailRepository;
        InboundOrderRepository = inboundOrderRepository;
        OutboundDetailRepository = detailRepository;
        OutboundOrderRepository = orderRepository;
    }

    public async Task<List<DetailQuery>> GetInbound(GetInput input)
    {
        var dquery = await InboundDetailRepository.GetQueryableAsync();
        var oquery = (await InboundOrderRepository.GetQueryableAsync())
            .Where(e => e.Status == InboundOrderStatus.Shelfed
            && e.CreationTime >= input.StartTime.LocalDateTime
            && e.CreationTime < input.EndTime.LocalDateTime
            && e.WarehouseId == input.WarehouseId);

        var list = dquery.Join(oquery, pd => pd.InboundOrderId, po => po.Id, (d, o) => new DetailQuery()
        {
            OrderNumber = o.InboundNumber,
            RecvContact = null,
            InboundBatch = o.InboundBatch,
            Sku = d.Sku,
            Quantity = d.ShelvesQuantity,
            OtherInfo = o.OtherInfo,
            CreationTime = o.CreationTime,
        }).ToList();

        // 处理时间
        list.ForEach(item =>
        {
            item.CreationTime = new DateTimeOffset(item.CreationTime.DateTime);
        });

        return list;
    }

    public async Task<List<DetailQuery>> GetOutbound(GetInput input)
    {
        var dquery = await OutboundDetailRepository.GetQueryableAsync();
        var oquery = (await OutboundOrderRepository.GetQueryableAsync())
            .Where(e => e.Status == OutboundOrderStatus.Outofstock 
            && e.CreationTime >= input.StartTime.LocalDateTime 
            && e.CreationTime < input.EndTime.LocalDateTime
            && e.WarehouseId == input.WarehouseId);

        var list = dquery.Join(oquery, pd => pd.OutboundOrderId, po => po.Id, (d, o) => new DetailQuery()
        {
            OrderNumber = o.OutboundNumber,
            RecvContact = o.RecvContact,
            Sku = d.Sku,
            Quantity = d.SortedQuantity,
            OtherInfo = o.OtherInfo,
            CreationTime = o.CreationTime,
        }).ToList();

        // 处理时间
        list.ForEach(item =>
        {
            item.CreationTime = new DateTimeOffset(item.CreationTime.DateTime);
        });

        return list;
    }

    public class DetailQuery
    {
        public string OrderNumber { get; set; }

        public string RecvContact { get; set; }

        public string InboundBatch {get;set;}

        public string Sku { get; set; }

        public int Quantity { get; set; }

        public string OtherInfo { get; set; }

        public DateTimeOffset CreationTime { get; set; }
    }

    public class GetInput
    {
        [Required]
        public DateTimeOffset StartTime { get; set; }

        [Required]
        public DateTimeOffset EndTime { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }
    }
}