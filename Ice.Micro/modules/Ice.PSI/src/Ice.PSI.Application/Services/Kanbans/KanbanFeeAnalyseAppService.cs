using Ice.PSI.Core;
using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Repositories;

namespace Ice.PSI.Services.Kanbans
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class KanbanFeeAnalyseAppService : PSIAppService
    {
        protected IRepository<PurchaseOrder, Guid> PurchaseOrderRepository { get; }

        protected IRepository<PurchaseReturnOrder, Guid> PurchaseReturnOrderRepository { get; }

        protected IRepository<SaleOrder, Guid> SaleOrderRepository { get; }

        protected IRepository<SaleReturnOrder, Guid> SaleReturnOrderRepository { get; }

        public KanbanFeeAnalyseAppService(
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

        public async Task<GetAllFeeAnalyseOutput> GetAllFeeAnalyseAsync(GetFeeAnalyseInput input)
        {
            return new GetAllFeeAnalyseOutput()
            {
                Purchase = (await GetPurchaseOrderFeeAnalyseAsync(input)),
                PurchaseReturn = (await GetPurchaseReturnOrderFeeAnalyseAsync(input)),
                Sale = (await GetSaleOrderFeeAnalyseAsync(input)),
                SaleReturn = (await GetReturnOrderFeeAnalyseAsync(input)),
            };
        }

        /// <summary>
        /// 费用分析
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<GetFeeAnalyseOutput> GetPurchaseOrderFeeAnalyseAsync(GetFeeAnalyseInput input)
        {
            IQueryable<PurchaseOrder> queryable = await PurchaseOrderRepository.GetQueryableAsync();
            if (input.IsSettlement.HasValue)
            {
                queryable = queryable.Where(e => e.IsSettlement == input.IsSettlement);
            }
            queryable = queryable.Where(e => e.Status == PurchaseOrderStatus.Completed && e.FinishDate > input.StartTime.LocalDateTime && e.FinishDate < input.EndTime.LocalDateTime);
            int orderTotal = queryable.Count();
            int skuTotal = queryable.SelectMany(e => e.Details).Sum(e => e.Quantity);
            decimal feeTotal = queryable.Sum(e => e.Price);
            decimal feeTotalPaid = queryable.Sum(e => e.PricePaid);

            var paymentMethodDetails = queryable.GroupBy(e => e.PaymentMethodId).Select(group =>
                new GetFeeAnalyseOutputPaymentMethodItem()
                {
                    PaymentMethodId = group.Key,
                    FeeTotal = group.Sum(e => e.Price),
                    FeeTotalPaid = group.Sum(e => e.PricePaid),
                }
            ).ToList();

            return new GetFeeAnalyseOutput()
            {
                OrderTotal = orderTotal,
                SkuTotal = skuTotal,
                FeeTotal = feeTotal,
                FeeTotalPaid = feeTotalPaid,
                PaymentMethodDetails = paymentMethodDetails
            };
        }

        /// <summary>
        /// 费用分析
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<GetFeeAnalyseOutput> GetPurchaseReturnOrderFeeAnalyseAsync(GetFeeAnalyseInput input)
        {
            IQueryable<PurchaseReturnOrder> queryable = await PurchaseReturnOrderRepository.GetQueryableAsync();
            if (input.IsSettlement.HasValue)
            {
                queryable = queryable.Where(e => e.IsSettlement == input.IsSettlement);
            }
            queryable = queryable.Where(e => e.Status == PurchaseReturnOrderStatus.Completed && e.FinishDate > input.StartTime.LocalDateTime && e.FinishDate < input.EndTime.LocalDateTime);
            int orderTotal = queryable.Count();
            int skuTotal = queryable.SelectMany(e => e.Details).Sum(e => e.Quantity);
            decimal feeTotal = queryable.Sum(e => e.Price);

            var paymentMethodDetails = queryable.GroupBy(e => e.PaymentMethodId).Select(group =>
                            new GetFeeAnalyseOutputPaymentMethodItem()
                            {
                                PaymentMethodId = group.Key,
                                FeeTotal = group.Sum(e => e.Price),
                            }
                        ).ToList();

            return new GetFeeAnalyseOutput()
            {
                OrderTotal = orderTotal,
                SkuTotal = skuTotal,
                FeeTotal = feeTotal,
                PaymentMethodDetails = paymentMethodDetails
            };
        }

        /// <summary>
        /// 费用分析
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<GetFeeAnalyseOutput> GetSaleOrderFeeAnalyseAsync(GetFeeAnalyseInput input)
        {
            IQueryable<SaleOrder> queryable = (await SaleOrderRepository.GetQueryableAsync());
            if (input.IsSettlement.HasValue)
            {
                queryable = queryable.Where(e => e.IsSettlement == input.IsSettlement);
            }
            queryable = queryable.Where(e => e.Status == SaleOrderStatus.Completed && e.FinishDate > input.StartTime.LocalDateTime && e.FinishDate < input.EndTime.LocalDateTime);
            int saleOrderTotal = queryable.Count();
            int saleOrderSkuTotal = queryable.SelectMany(e => e.Details).Sum(e => e.Quantity);
            decimal saleOrderFeeTotal = queryable.Sum(e => e.TotalPrice);
            decimal feeTotalPaid = queryable.Sum(e => e.TotalPricePaid);

            var paymentMethodDetails = queryable.GroupBy(e => e.PaymentMethodId).Select(group =>
                        new GetFeeAnalyseOutputPaymentMethodItem()
                        {
                            PaymentMethodId = group.Key,
                            FeeTotal = group.Sum(e => e.TotalPrice),
                            FeeTotalPaid = group.Sum(e => e.TotalPricePaid),
                        }
                    ).ToList();

            return new GetFeeAnalyseOutput()
            {
                OrderTotal = saleOrderTotal,
                SkuTotal = saleOrderSkuTotal,
                FeeTotal = saleOrderFeeTotal,
                FeeTotalPaid = feeTotalPaid,
                PaymentMethodDetails = paymentMethodDetails
            };
        }

        /// <summary>
        /// 费用分析
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<GetFeeAnalyseOutput> GetReturnOrderFeeAnalyseAsync(GetFeeAnalyseInput input)
        {
            IQueryable<SaleReturnOrder> queryable = (await SaleReturnOrderRepository.GetQueryableAsync()).Where(e => e.Status == SaleReturnOrderStatus.Completed);
            if (input.IsSettlement.HasValue)
            {
                queryable = queryable.Where(e => e.IsSettlement == input.IsSettlement);
            }
            queryable = queryable.Where(e => e.Status == SaleReturnOrderStatus.Completed && e.FinishDate > input.StartTime.LocalDateTime && e.FinishDate < input.EndTime.LocalDateTime);
            int orderTotal = queryable.Count();
            int orderSkuTotal = queryable.SelectMany(e => e.Details).Sum(e => e.Quantity);
            decimal orderFeeTotal = queryable.Sum(e => e.TotalPrice);

            var paymentMethodDetails = queryable.GroupBy(e => e.PaymentMethodId).Select(group =>
                            new GetFeeAnalyseOutputPaymentMethodItem()
                            {
                                PaymentMethodId = group.Key,
                                FeeTotal = group.Sum(e => e.TotalPrice),
                            }
                        ).ToList();

            return new GetFeeAnalyseOutput()
            {
                OrderTotal = orderTotal,
                SkuTotal = orderSkuTotal,
                FeeTotal = orderFeeTotal,
                PaymentMethodDetails = paymentMethodDetails
            };
        }
    }
}
