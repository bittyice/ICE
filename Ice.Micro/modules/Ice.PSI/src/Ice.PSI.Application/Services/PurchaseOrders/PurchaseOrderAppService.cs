using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Dtos;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Volo.Abp;
using Ice.PSI.Core.Suppliers;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Ice.PSI.Core;

namespace Ice.PSI.Services.PurchaseOrders
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class PurchaseOrderAppService : PSIAppService
    {
        protected IRepository<PurchaseOrder, Guid> PurchaseOrderRepository { get; }

        protected IRepository<Supplier, Guid> SupplierRepository { get; }

        protected PurchaseOrderManager PurchaseOrderManager { get; }

        protected StockManager StockManager { get; }

        public PurchaseOrderAppService(
            IRepository<PurchaseOrder, Guid> purchaseOrderRepository,
            IRepository<Supplier, Guid> supplierRepository,
            PurchaseOrderManager purchaseOrderManager,
            StockManager stockManager)
        {
            PurchaseOrderRepository = purchaseOrderRepository;
            SupplierRepository = supplierRepository;
            PurchaseOrderManager = purchaseOrderManager;
            StockManager = stockManager;
        }

        public async Task<PagedResultDto<PurchaseOrderDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(PurchaseOrder.CreationTime)
                && sorting != nameof(PurchaseOrder.OrderNumber)
                && sorting != nameof(PurchaseOrder.Status)
                )
            {
                sorting = nameof(PurchaseOrder.CreationTime);
            }

            IQueryable<PurchaseOrder> queryable = await PurchaseOrderRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.OrderNumber))
            {
                queryable = queryable.Where(e => e.OrderNumber == input.OrderNumber);
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

            if (input.SupplierId != null)
            {
                queryable = queryable.Where(e => e.SupplierId == input.SupplierId);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            long count = queryable.Count();
            List<PurchaseOrder> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<PurchaseOrderDto>(
                count,
                ObjectMapper.Map<List<PurchaseOrder>, List<PurchaseOrderDto>>(list)
            );
        }

        public async Task<PurchaseOrderDto> GetAsync(Guid id)
        {
            var entity = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<PurchaseOrder, PurchaseOrderDto>(entity);
        }

        public async Task<List<PurchaseOrderDto>> GetListWithDetailsAsync(GetListWithDetailsInput input)
        {
            var list = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).Where(e => input.Ids.Contains(e.Id)).ToList();
            return ObjectMapper.Map<List<PurchaseOrder>, List<PurchaseOrderDto>>(list);
        }

        public async Task CreateAsync(CreateInput input)
        {
            if (input.Details.Count == 0)
            {
                throw new UserFriendlyException(message: "请添加产品明细");
            }

            var order = new PurchaseOrder(GuidGenerator.Create(), Tool.CommonOrderNumberCreate(), input.SupplierId, CurrentUser.TenantId.Value);
            order.Price = input.Price;
            order.Remark = input.Remark;
            order.ExtraInfo = input.ExtraInfo;
            input.Details.ForEach(item =>
            {
                var detail = new PurchaseDetail(GuidGenerator.Create(), item.Sku, CurrentUser.TenantId.Value);
                detail.Quantity = item.Quantity;
                detail.GiveQuantity = item.GiveQuantity;
                detail.Price = item.Price;
                detail.Remark = item.Remark;
                order.Details.Add(detail);
            });
            await PurchaseOrderManager.CreateAsync(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            if (input.Details.Count == 0)
            {
                throw new UserFriendlyException(message: "请添加产品明细");
            }

            var order = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.Price = input.Price;
            order.Remark = input.Remark;
            order.ExtraInfo = input.ExtraInfo;
            order.ClearDetails();
            input.Details.ForEach(item =>
            {
                var detail = new PurchaseDetail(GuidGenerator.Create(), item.Sku, CurrentUser.TenantId.Value);
                detail.Quantity = item.Quantity;
                detail.GiveQuantity = item.GiveQuantity;
                detail.Price = item.Price;
                detail.Remark = item.Remark;
                order.Details.Add(detail);
            });

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task ToPurchasing(Guid id)
        {
            var entity = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.ToPurchasing();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task ToFinish(Guid id)
        {
            var entity = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.ToFinish();
            await StockManager.ForPurchaseOrder(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 快速处理
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task FastHandleAsync(Guid id, FastHandleInput input)
        {
            var entity = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            var supplierName = (await SupplierRepository.FirstOrDefaultAsync(e => e.Id == entity.SupplierId))?.Name;
            entity.ToPurchasing();
            entity.ToFinish();
            await StockManager.ForPurchaseOrder(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 结算
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task Settlement(Guid id)
        {
            var entity = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.Settlement();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 设置已支付总价
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task SetPricePaid(Guid id, SetPricePaidInput input)
        {
            var entity = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.SetPricePaid(input.PricePaid);
        }

        [HttpPut]
        public async Task SetPaymentMethod(Guid id, SetPaymentMethodInput input)
        {
            var entity = await PurchaseOrderRepository.FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.PaymentMethodId = input.PaymentMethodId;
        }

        /// <summary>
        /// 作废
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task InvalidAsync(Guid id)
        {
            var entity = (await PurchaseOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.Invalid();
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
