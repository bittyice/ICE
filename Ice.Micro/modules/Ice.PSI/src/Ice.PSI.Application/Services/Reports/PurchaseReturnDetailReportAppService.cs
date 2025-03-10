using Ice.PSI.Core;
using Ice.PSI.Core.PurchaseReturnOrders;
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
    public class PurchaseReturnDetailReportAppService : PSIAppService
    {
        protected IRepository<PurchaseReturnDetail> PurchaseReturnDetailRepository { get; }

        protected IRepository<PurchaseReturnOrder> PurchaseReturnOrderRepository { get; }

        public PurchaseReturnDetailReportAppService(
            IRepository<PurchaseReturnDetail> purchaseDetailRepository,
            IRepository<PurchaseReturnOrder> purchaseOrderRepository)
        {
            PurchaseReturnDetailRepository = purchaseDetailRepository;
            PurchaseReturnOrderRepository = purchaseOrderRepository;
        }

        public async Task<List<DetailQuery>> Get(GetInput input)
        {
            var pdquery = await PurchaseReturnDetailRepository.GetQueryableAsync();
            var poquery = (await PurchaseReturnOrderRepository.GetQueryableAsync()).Where(e => e.Status == PurchaseReturnOrderStatus.Completed && e.FinishDate >= input.StartTime.LocalDateTime && e.FinishDate < input.EndTime.LocalDateTime);

            if (input.IsSettlement != null)
            {
                poquery = poquery.Where(e => e.IsSettlement == input.IsSettlement);
            }

            var list = pdquery.Join(poquery, pd => pd.PurchaseReturnOrderId, po => po.Id, (pd, po) => new DetailQuery()
            {
                OrderNumber = po.OrderNumber,
                PaymentMethodId = po.PaymentMethodId,
                SupplierId = po.SupplierId,
                Sku = pd.Sku,
                Quantity = pd.Quantity,
                UnitPrice = pd.Price,
                CreationTime = po.CreationTime,
                FinishDate = po.FinishDate,
            }).ToList();

            // 处理时间
            list.ForEach(item =>
            {
                item.CreationTime = new DateTimeOffset(item.CreationTime.DateTime);
                item.FinishDate = item.FinishDate.HasValue ? new DateTimeOffset(item.FinishDate.Value.DateTime) : null;
            });

            return list;
        }

        public class DetailQuery
        {
            public string OrderNumber { get; set; }

            public Guid? PaymentMethodId { get; set; }

            public Guid SupplierId { get; set; }

            public string Sku { get; set; }

            public int Quantity { get; set; }

            public decimal UnitPrice { get; set; }

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
