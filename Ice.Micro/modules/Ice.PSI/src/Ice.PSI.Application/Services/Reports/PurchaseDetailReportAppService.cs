using Ice.PSI.Core;
using Ice.PSI.Core.PurchaseOrders;
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
    public class PurchaseDetailReportAppService : PSIAppService
    {
        protected IRepository<PurchaseDetail> PurchaseDetailRepository { get; }

        protected IRepository<PurchaseOrder> PurchaseOrderRepository { get; }

        public PurchaseDetailReportAppService(
            IRepository<PurchaseDetail> purchaseDetailRepository,
            IRepository<PurchaseOrder> purchaseOrderRepository)
        {
            PurchaseDetailRepository = purchaseDetailRepository;
            PurchaseOrderRepository = purchaseOrderRepository;
        }

        public async Task<List<DetailQuery>> Get(GetInput input)
        {
            var pdquery = await PurchaseDetailRepository.GetQueryableAsync();
            var poquery = (await PurchaseOrderRepository.GetQueryableAsync()).Where(e => e.Status == PurchaseOrderStatus.Completed && e.FinishDate >= input.StartTime.LocalDateTime && e.FinishDate < input.EndTime.LocalDateTime);

            if (input.IsSettlement != null)
            {
                poquery = poquery.Where(e => e.IsSettlement == input.IsSettlement);
            }

            var list = pdquery.Join(poquery, pd => pd.PurchaseOrderId, po => po.Id, (pd, po) => new DetailQuery()
            {
                OrderNumber = po.OrderNumber,
                PaymentMethodId = po.PaymentMethodId,
                SupplierId = po.SupplierId,
                Sku = pd.Sku,
                Quantity = pd.Quantity,
                GiveQuantity = pd.GiveQuantity,
                UnitPrice = pd.Price,
                Remark = pd.Remark,
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

            public int GiveQuantity { get; set; }

            public decimal UnitPrice { get; set; }

            public string? Remark { get; set; }

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
