using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.Suppliers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Application.Dtos;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;

namespace Ice.PSI.Services.Reports
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class FeeInquiryAppService : PSIAppService
    {
        protected IRepository<PurchaseOrder, Guid> PurchaseOrderRepository { get; }

        protected IRepository<PurchaseReturnOrder, Guid> PurchaseReturnOrderRepository { get; }

        protected IRepository<SaleOrder, Guid> SaleOrderRepository { get; }

        protected IRepository<SaleReturnOrder, Guid> SaleReturnOrderRepository { get; }

        public FeeInquiryAppService(
            IRepository<PurchaseOrder, Guid> purchaseOrderRepository,
            IRepository<PurchaseReturnOrder, Guid> purchaseReturnOrderRepository,
            IRepository<SaleOrder, Guid> saleOrderRepository,
            IRepository<SaleReturnOrder, Guid> saleReturnOrderRepository) 
        {
            PurchaseOrderRepository = purchaseOrderRepository;
            PurchaseReturnOrderRepository = purchaseReturnOrderRepository;
            SaleOrderRepository = saleOrderRepository;
            SaleReturnOrderRepository = saleReturnOrderRepository;
        }

        public async Task<PagedResultDto<PurchaseFeeListItem>> GetPurchaseFeeList(GetPurchaseFeeListInput input) {
            var queryable = (await PurchaseOrderRepository.GetQueryableAsync()).IceOrderBy("SupplierId");

            if (input.Status != null) {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.SupplierId != null)
            {
                queryable = queryable.Where(e => e.SupplierId == input.SupplierId);
            }

            if (input.IsSettlement != null)
            {
                queryable = queryable.Where(e => e.IsSettlement == input.IsSettlement);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.FinishDateMin != null)
            {
                queryable = queryable.Where(e => e.FinishDate >= input.FinishDateMin.Value.LocalDateTime);
            }

            if (input.FinishDateMax != null)
            {
                queryable = queryable.Where(e => e.FinishDate <= input.FinishDateMax.Value.LocalDateTime);
            }

            var itemqueryable = queryable.GroupBy(e => e.SupplierId)
                .Select(e => new PurchaseFeeListItem() { SupplierId = e.Key, PriceTotal = e.Sum(e => e.Price), PriceTotalPaid = e.Sum(e => e.PricePaid), OrderCount = e.Count() });

            long count = itemqueryable.Count();
            var list = itemqueryable.Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<PurchaseFeeListItem>(
                count,
                list
            );
        }

        public async Task<PagedResultDto<PurchaseReturnFeeListItem>> GetPurchaseReturnFeeList(GetPurchaseReturnFeeListInput input)
        {
            var queryable = (await PurchaseReturnOrderRepository.GetQueryableAsync()).IceOrderBy("SupplierId");

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.SupplierId != null)
            {
                queryable = queryable.Where(e => e.SupplierId == input.SupplierId);
            }

            if (input.IsSettlement != null)
            {
                queryable = queryable.Where(e => e.IsSettlement == input.IsSettlement);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.FinishDateMin != null)
            {
                queryable = queryable.Where(e => e.FinishDate >= input.FinishDateMin.Value.LocalDateTime);
            }

            if (input.FinishDateMax != null)
            {
                queryable = queryable.Where(e => e.FinishDate <= input.FinishDateMax.Value.LocalDateTime);
            }

            var itemqueryable = queryable.GroupBy(e => e.SupplierId)
                .Select(e => new PurchaseReturnFeeListItem() { SupplierId = e.Key, PriceTotal = e.Sum(e => e.Price), OrderCount = e.Count() });

            long count = itemqueryable.Count();
            var list = itemqueryable.Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<PurchaseReturnFeeListItem>(
                count,
                list
            );
        }

        public async Task<PagedResultDto<SaleFeeListItem>> GetSaleFeeList(GetSaleFeeListInput input) {
            var queryable = (await SaleOrderRepository.GetQueryableAsync());

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.BusinessName != null)
            {
                queryable = queryable.Where(e => e.RecvInfo.BusinessName == input.BusinessName);
            }

            if (input.IsSettlement != null)
            {
                queryable = queryable.Where(e => e.IsSettlement == input.IsSettlement);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.FinishDateMin != null)
            {
                queryable = queryable.Where(e => e.FinishDate >= input.FinishDateMin.Value.LocalDateTime);
            }

            if (input.FinishDateMax != null)
            {
                queryable = queryable.Where(e => e.FinishDate <= input.FinishDateMax.Value.LocalDateTime);
            }

            var itemqueryable = queryable.OrderBy(e => e.RecvInfo.BusinessName).GroupBy(e => e.RecvInfo.BusinessName)
                .Select(e => new SaleFeeListItem() { BusinessName = e.Key, TotalPrice = e.Sum(e => e.TotalPrice), TotalPricePaid = e.Sum(e => e.TotalPricePaid), OrderCount = e.Count() });

            long count = itemqueryable.Count();
            var list = itemqueryable.Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<SaleFeeListItem>(
                count,
                list
            );
        }

        public async Task<PagedResultDto<SaleReturnFeeListItem>> GetSaleReturnFeeList(GetSaleFeeListInput input)
        {
            var queryable = (await SaleReturnOrderRepository.GetQueryableAsync());

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.BusinessName != null)
            {
                queryable = queryable.Where(e => e.BusinessName == input.BusinessName);
            }

            if (input.IsSettlement != null)
            {
                queryable = queryable.Where(e => e.IsSettlement == input.IsSettlement);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.FinishDateMin != null)
            {
                queryable = queryable.Where(e => e.FinishDate >= input.FinishDateMin.Value.LocalDateTime);
            }

            if (input.FinishDateMax != null)
            {
                queryable = queryable.Where(e => e.FinishDate <= input.FinishDateMax.Value.LocalDateTime);
            }

            var itemqueryable = queryable.OrderBy(e => e.BusinessName).GroupBy(e => e.BusinessName)
                .Select(e => new SaleReturnFeeListItem() { BusinessName = e.Key, TotalPrice = e.Sum(e => e.TotalPrice), OrderCount = e.Count() });

            long count = itemqueryable.Count();
            var list = itemqueryable.Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<SaleReturnFeeListItem>(
                count,
                list
            );
        }

        public class PurchaseFeeListItem {
            public Guid SupplierId { get; set; }

            public decimal PriceTotal { get; set; }

            public decimal PriceTotalPaid { get; set; }

            public int OrderCount { get; set; }
        }

        public class PurchaseReturnFeeListItem {
            public Guid SupplierId { get; set; }

            public decimal PriceTotal { get; set; }

            public int OrderCount { get; set; }
        }

        public class SaleFeeListItem {
            public string BusinessName { get; set; }

            public decimal TotalPrice { get; set; }

            public decimal TotalPricePaid { get; set; }

            public int OrderCount { get; set; }
        }

        public class SaleReturnFeeListItem
        {
            public string BusinessName { get; set; }

            public decimal TotalPrice { get; set; }

            public int OrderCount { get; set; }
        }
    }
}
