using Ice.PSI.Core;
using Ice.PSI.Core.SaleReturnOrders;
using Ice.PSI.Dtos;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;

namespace Ice.PSI.Services.SaleReturnOrders
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class SaleReturnOrderAppService : PSIAppService
    {
        protected IRepository<SaleReturnOrder, Guid> SaleReturnOrderRepository { get; }

        protected SaleReturnManager SaleReturnManager { get; }

        protected StockManager StockManager { get; }

        public SaleReturnOrderAppService(
            IRepository<SaleReturnOrder, Guid> saleReturnOrderRepository,
            SaleReturnManager saleReturnManager,
            StockManager stockManager)
        {
            SaleReturnOrderRepository = saleReturnOrderRepository;
            SaleReturnManager = saleReturnManager;
            StockManager = stockManager;
        }

        public async Task<PagedResultDto<SaleReturnOrderDto>> GetListAsync(GetListInput input)
        {
            var sorting = nameof(SaleReturnOrder.CreationTime);

            IQueryable<SaleReturnOrder> queryable = await SaleReturnOrderRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.OrderNumber))
            {
                queryable = queryable.Where(e => e.OrderNumber == input.OrderNumber);
            }

            if (!string.IsNullOrWhiteSpace(input.SaleNumber))
            {
                queryable = queryable.Where(e => e.SaleNumber == input.SaleNumber);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            long count = queryable.Count();
            List<SaleReturnOrder> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<SaleReturnOrderDto>(
                count,
                ObjectMapper.Map<List<SaleReturnOrder>, List<SaleReturnOrderDto>>(list)
            );
        }

        public async Task<List<SaleReturnOrderDto>> GetListForIdsAsync(GetListForIdsInput input)
        {
            var list = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).Where(e => input.Ids.Contains(e.Id)).ToList();
            return ObjectMapper.Map<List<SaleReturnOrder>, List<SaleReturnOrderDto>>(list);
        }

        public async Task<SaleReturnOrderDto> GetAsync(Guid id)
        {
            var entity = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<SaleReturnOrder, SaleReturnOrderDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            var order = new SaleReturnOrder(GuidGenerator.Create(), Tool.CommonOrderNumberCreate(), input.SaleNumber, CurrentUser.TenantId.Value);
            order.BusinessName = input.BusinessName;
            order.Remark = input.Remark;
            order.ExtraInfo = input.ExtraInfo;
            input.Details.ForEach(item =>
            {
                var detail = new SaleReturnDetail(GuidGenerator.Create(), item.Sku, item.Quantity, item.UnitPrice);
                order.Details.Add(detail);
            });
            await SaleReturnManager.CreateAsync(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var order = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.BusinessName = input.BusinessName;
            order.Remark = input.Remark;
            order.ExtraInfo = input.ExtraInfo;
            order.ClearDetails();
            input.Details.ForEach(item =>
            {
                var detail = new SaleReturnDetail(GuidGenerator.Create(), item.Sku, item.Quantity, item.UnitPrice);
                order.Details.Add(detail);
            });

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task RejectedAsync(Guid id, RejectedInput input)
        {
            var order = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.Rejected(input.RejectReason);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 通过退货申请
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task ConfirmAsync(Guid id, ConfirmReturnInput input)
        {
            var order = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.ConfirmReturn(input.TotalPrice);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 取消确认
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task Unconfirm(Guid id)
        {
            var order = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.UnconfirmReturn();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 处理
        /// </summary>
        /// <returns></returns>
        public async Task ProcessedAsync(Guid id)
        {
            var order = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.ProcessedReturn();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 快速处理
        /// </summary>
        /// <returns></returns>
        public async Task FastHandleAsync(Guid id, FastHandleInput input)
        {
            var order = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.ConfirmReturn(input.TotalPrice);
            order.ProcessedReturn();
            order.CompletedReturn();
            await StockManager.ForClientReturnOrder(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 完成退货
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task CompletedAsync(Guid id)
        {
            var order = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }
            order.CompletedReturn();
            await StockManager.ForClientReturnOrder(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 退货结算
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPost]
        public async Task Settlement(Guid id)
        {
            var order = (await SaleReturnOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }
            order.ReturnSettlement();
        }

        [HttpPut]
        public async Task SetPaymentMethod(Guid id, SetPaymentMethodInput input)
        {
            var entity = await SaleReturnOrderRepository.FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.PaymentMethodId = input.PaymentMethodId;
        }
    }
}
