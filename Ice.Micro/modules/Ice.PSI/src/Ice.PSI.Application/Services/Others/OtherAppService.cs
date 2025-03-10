using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.PSI.Others
{
    public class OtherAppService : PSIAppService
    {
        protected IRepository<PurchaseOrder, Guid> PurchaseOrderRepository { get; }

        protected IRepository<PurchaseReturnOrder, Guid> PurchaseReturnOrderRepository { get; }

        protected IRepository<SaleOrder, Guid> SaleOrderRepository { get; }

        protected IRepository<SaleReturnOrder, Guid> SaleReturnOrderRepository { get; }

        public OtherAppService(
            IRepository<PurchaseOrder, Guid> purchaseOrderRepository,
            IRepository<PurchaseReturnOrder, Guid> purchaseReturnRepository,
            IRepository<SaleOrder, Guid> saleOrderRepository,
            IRepository<SaleReturnOrder, Guid> saleReturnOrderRepository
        )
        {
            PurchaseOrderRepository = purchaseOrderRepository;
            PurchaseReturnOrderRepository = purchaseReturnRepository;
            SaleOrderRepository = saleOrderRepository;
            SaleReturnOrderRepository = saleReturnOrderRepository;
        }

        [HttpGet]
        [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
        public async Task<SearchOrderOutputItem?> SearchOrderAsync(SearchOrderInput input)
        {
            SearchOrderOutputItem? result;

            result = (await SaleOrderRepository.GetQueryableAsync()).Where(e => e.OrderNumber == input.OrderNumber).Select(e => new SearchOrderOutputItem()
            {
                OrderNumber = e.OrderNumber,
                Type = "S"
            }).FirstOrDefault();

            if (result != null)
            {
                return result;
            }

            result = (await PurchaseOrderRepository.GetQueryableAsync()).Where(e => e.OrderNumber == input.OrderNumber).Select(e => new SearchOrderOutputItem()
            {
                OrderNumber = e.OrderNumber,
                Type = "P"
            }).FirstOrDefault();

            if (result != null)
            {
                return result;
            }

            result = (await SaleReturnOrderRepository.GetQueryableAsync()).Where(e => e.OrderNumber == input.OrderNumber).Select(e => new SearchOrderOutputItem()
            {
                OrderNumber = e.OrderNumber,
                Type = "SR"
            }).FirstOrDefault();

            if (result != null)
            {
                return result;
            }

            result = (await PurchaseReturnOrderRepository.GetQueryableAsync()).Where(e => e.OrderNumber == input.OrderNumber).Select(e => new SearchOrderOutputItem()
            {
                OrderNumber = e.OrderNumber,
                Type = "PR"
            }).FirstOrDefault();

            if (result != null)
            {
                return result;
            }

            return null;
        }
    }
}
