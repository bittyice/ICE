using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Volo.Abp;
using Microsoft.AspNetCore.Mvc;
using Ice.PSI.Core.Suppliers;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;
using Ice.PSI.Core;

namespace Ice.PSI.Services.PurchaseReturnOrders
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class PurchaseReturnOrderAppService : PSIAppService
    {
        protected IRepository<PurchaseReturnOrder> PurchaseReturnOrderRepository { get; }

        protected IRepository<Supplier, Guid> SupplierRepository { get; }

        protected PurchaseReturnOrderManager PurchaseReturnOrderManager { get; }

        protected StockManager StockManager { get; }

        public PurchaseReturnOrderAppService(
            IRepository<PurchaseReturnOrder> purchaseReturnOrderRepository,
            IRepository<Supplier, Guid> supplierRepository,
            PurchaseReturnOrderManager purchaseReturnOrderManager,
            StockManager stockManager)
        {
            PurchaseReturnOrderRepository = purchaseReturnOrderRepository;
            SupplierRepository = supplierRepository;
            PurchaseReturnOrderManager = purchaseReturnOrderManager;
            StockManager = stockManager;
        }

        public async Task<PagedResultDto<PurchaseReturnOrderDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(PurchaseReturnOrder.CreationTime)
                && sorting != nameof(PurchaseReturnOrder.OrderNumber)
                && sorting != nameof(PurchaseReturnOrder.Status)
                )
            {
                sorting = nameof(PurchaseReturnOrder.CreationTime);
            }

            IQueryable<PurchaseReturnOrder> queryable = await PurchaseReturnOrderRepository.GetQueryableAsync();

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

            if (input.SupplierId != null) {
                queryable = queryable.Where(e => e.SupplierId == input.SupplierId);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            long count = queryable.Count();
            List<PurchaseReturnOrder> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<PurchaseReturnOrderDto>(
                count,
                ObjectMapper.Map<List<PurchaseReturnOrder>, List<PurchaseReturnOrderDto>>(list)
            );
        }

        public async Task<PurchaseReturnOrderDto> GetAsync(Guid id)
        {
            var entity = (await PurchaseReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<PurchaseReturnOrder, PurchaseReturnOrderDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            if (input.Details.Count == 0)
            {
                throw new UserFriendlyException(message: "请添加产品明细");
            }

            var order = new PurchaseReturnOrder(GuidGenerator.Create(), Tool.CommonOrderNumberCreate(), input.SupplierId, CurrentUser.TenantId.Value);
            order.Price = input.Price;
            order.Reason = input.Reason;
            order.Remark = input.Remark;
            order.ExtraInfo = input.ExtraInfo;
            input.Details.ForEach(item =>
            {
                var detail = new PurchaseReturnDetail(GuidGenerator.Create(), item.Sku, CurrentUser.TenantId.Value);
                detail.Quantity = item.Quantity;
                detail.Price = item.Price;
                order.Details.Add(detail);
            });
            await PurchaseReturnOrderManager.CreateAsync(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            if (input.Details.Count == 0)
            {
                throw new UserFriendlyException(message: "请添加产品明细");
            }

            var order = (await PurchaseReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.Price = input.Price;
            order.Reason = input.Reason;
            order.Remark = input.Remark;
            order.ExtraInfo = input.ExtraInfo;
            order.ClearDetails();
            input.Details.ForEach(item =>
            {
                var detail = new PurchaseReturnDetail(GuidGenerator.Create(), item.Sku, CurrentUser.TenantId.Value);
                detail.Quantity = item.Quantity;
                detail.Price = item.Price;
                order.Details.Add(detail);
            });

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task ToReturning(Guid id)
        {
            var entity = (await PurchaseReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.ToReturning();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task ToFinish(Guid id)
        {
            var entity = (await PurchaseReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.ToFinish();
            await StockManager.ForPurchaseReturnOrder(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task FastHandleAsync(Guid id, FastHandleInput input) {
            var entity = (await PurchaseReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            var supplierName = (await SupplierRepository.FirstOrDefaultAsync(e => e.Id == entity.SupplierId))?.Name;
            entity.ToReturning();
            entity.ToFinish();
            await StockManager.ForPurchaseReturnOrder(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task Settlement(Guid id)
        {
            var entity = (await PurchaseReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.Settlement();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task SetPaymentMethod(Guid id, SetPaymentMethodInput input)
        {
            var entity = await PurchaseReturnOrderRepository.FirstOrDefaultAsync(e => e.Id == id);
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
            var entity = (await PurchaseReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.Invalid();
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
