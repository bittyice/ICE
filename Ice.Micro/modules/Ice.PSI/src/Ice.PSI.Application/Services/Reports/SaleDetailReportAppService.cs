using Ice.PSI.Core;
using Ice.PSI.Core.SaleOrders;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.PSI.Services.Reports
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class SaleDetailReportAppService : PSIAppService
    {
        protected IRepository<SaleDetail> DetailRepository { get; }

        protected IRepository<SaleOrder> OrderRepository { get; }

        public SaleDetailReportAppService(
            IRepository<SaleDetail> detailRepository,
            IRepository<SaleOrder> orderRepository)
        {
            DetailRepository = detailRepository;
            OrderRepository = orderRepository;
        }

        public async Task<List<DetailQuery>> Get(GetInput input)
        {
            var dquery = await DetailRepository.GetQueryableAsync();
            var oquery = (await OrderRepository.GetQueryableAsync()).Where(e => e.Status == SaleOrderStatus.Completed && e.FinishDate >= input.StartTime.LocalDateTime && e.FinishDate < input.EndTime.LocalDateTime);

            if (input.IsSettlement != null)
            {
                oquery = oquery.Where(e => e.IsSettlement == input.IsSettlement);
            }

            var list = dquery.Join(oquery, pd => pd.SaleOrderId, po => po.Id, (d, o) => new DetailQuery()
            {
                OrderNumber = o.OrderNumber,
                PaymentMethodId = o.PaymentMethodId,
                BusinessName = o.RecvInfo.BusinessName,
                Sku = d.Sku,
                Quantity = d.Quantity,
                GiveQuantity = d.GiveQuantity,
                UnitPrice = d.PlacePrice,
                Seller = o.Seller,
                CreationTime = o.CreationTime,
                FinishDate = o.FinishDate
            }).ToList();

            // 处理时间
            list.ForEach(item => {
                item.CreationTime = new DateTimeOffset(item.CreationTime.DateTime);
                item.FinishDate = item.FinishDate.HasValue ? new DateTimeOffset(item.FinishDate.Value.DateTime) : null;
            });

            return list;
        }

        public class DetailQuery
        {
            public string OrderNumber { get; set; }

            public Guid? PaymentMethodId { get; set; }

            public string BusinessName { get; set; }

            public string Sku { get; set; }

            public int Quantity { get; set; }

            public int GiveQuantity { get; set; }

            public decimal UnitPrice { get; set; }

            public string? Seller { get; set; }

            public DateTimeOffset CreationTime { get; set; }

            public DateTimeOffset? FinishDate { get; set; }
        }

        public class GetInput
        {
            [Required]
            public DateTimeOffset StartTime { get; set; }

            [Required]
            public DateTimeOffset EndTime { get; set; }

            public bool? IsSettlement { get; set; }
        }
    }
}
