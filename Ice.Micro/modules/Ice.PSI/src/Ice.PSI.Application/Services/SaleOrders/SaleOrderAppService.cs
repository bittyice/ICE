using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Dtos;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;
using Ice.PSI.Core;

namespace Ice.PSI.Services.SaleOrders
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class SaleOrderAppService : PSIAppService
    {
        protected IRepository<SaleOrder, Guid> SaleOrderRepository { get; }

        protected IRepository<SaleDetail, Guid> SaleDetailRepository { get; }

        protected StockManager StockManager { get; }

        public SaleOrderAppService(
            IRepository<SaleOrder, Guid> saleOrderRepository,
            IRepository<SaleDetail, Guid> saleDetailRepository,
            StockManager stockManager)
        {
            SaleOrderRepository = saleOrderRepository;
            SaleDetailRepository = saleDetailRepository;
            StockManager = stockManager;
        }

        #region 销售操作
        /// <summary>
        /// 获取列表(禁用门店过滤器)
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<PagedResultDto<SaleOrderDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(SaleOrder.CreationTime)
                && sorting != nameof(SaleOrder.Id)
                && sorting != nameof(SaleOrder.OrderNumber)
                )
            {
                sorting = nameof(SaleOrder.CreationTime);
            }

            IQueryable<SaleOrder> queryable = (await SaleOrderRepository.GetQueryableAsync());

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.OrderNumber))
            {
                queryable = queryable.Where(e => e.OrderNumber == input.OrderNumber);
            }

            if (!string.IsNullOrWhiteSpace(input.Seller))
            {
                queryable = queryable.Where(e => e.Seller == input.Seller);
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
            List<SaleOrder> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<SaleOrderDto>(
                count,
                ObjectMapper.Map<List<SaleOrder>, List<SaleOrderDto>>(list)
            );
        }

        /// <summary>
        /// 查询列表
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<List<SaleOrderDto>> GetListForIdsAsync(GetListForIdsInput input)
        {
            var list = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).Where(e => input.Ids.Contains(e.Id)).ToList();
            return ObjectMapper.Map<List<SaleOrder>, List<SaleOrderDto>>(list);
        }

        /// <summary>
        /// 查询列表
        /// </summary>
        /// <returns></returns>
        public async Task<List<SaleOrderDto>> GetListForOrderNumbersAsync(GetListForOrderNumbersInput input)
        {
            var list = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).Where(e => input.OrderNumbers.Contains(e.OrderNumber)).ToList();
            return ObjectMapper.Map<List<SaleOrder>, List<SaleOrderDto>>(list);
        }

        /// <summary>
        /// 获取实体
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<SaleOrderDto> GetAsync(Guid id)
        {
            var entity = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<SaleOrder, SaleOrderDto>(entity);
        }

        /// <summary>
        /// 获取上次客户的报价
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<List<SaleDetailDto>> GetLateBusinessQuotes(GetLateBusinessQuotesInput input)
        {
            var orderQuery = (await SaleOrderRepository.GetQueryableAsync()).Where(e => e.RecvInfo.BusinessName == input.BusinessName);
            var detailQuery = (await SaleDetailRepository.GetQueryableAsync())
            .Join(orderQuery, e => e.SaleOrderId, e => e.Id, (detail, order) => new { detail, order })
            .OrderByDescending(e => e.order.CreationTime)
            .Select(e => e.detail);

            List<SaleDetail> details = new List<SaleDetail>();
            foreach (var sku in input.Skus)
            {
                var detail = detailQuery.FirstOrDefault(e => e.Sku == sku);
                if (detail != null)
                {
                    details.Add(detail);
                }
            }

            return ObjectMapper.Map<List<SaleDetail>, List<SaleDetailDto>>(details);
        }

        /// <summary>
        /// 创建
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task CreateAsync(CreateInput input)
        {
            var skus = input.Details.Select(e => e.Sku).ToList();

            var recvInfo = new RecvInfo(input.RecvInfo.BusinessName, input.RecvInfo.Contact, input.RecvInfo.ContactNumber, input.RecvInfo.Province, input.RecvInfo.City, input.RecvInfo.Town, input.RecvInfo.Street, input.RecvInfo.AddressDetail, input.RecvInfo.Postcode);
            var order = new SaleOrder(GuidGenerator.Create(), Tool.CommonOrderNumberCreate(), CurrentTenant.Id.Value, recvInfo);
            order.Seller = input.Seller;
            order.ExtraInfo = input.ExtraInfo;
            order.Remark = input.Remark;
            input.Details.ForEach(item =>
            {
                var detail = new SaleDetail(GuidGenerator.Create(), item.Sku, item.Quantity, item.GiveQuantity, item.PlacePrice);
                order.AddInboundDetail(detail);
            });
            order.PlaceTotalPrice = Math.Round(order.Details.Sum(e => e.PlacePrice * e.Quantity), 2);
            await SaleOrderRepository.InsertAsync(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 更新
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var order = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            var skus = input.Details.Select(e => e.Sku).ToList();

            var recvInfo = new RecvInfo(input.RecvInfo.BusinessName, input.RecvInfo.Contact, input.RecvInfo.ContactNumber, input.RecvInfo.Province, input.RecvInfo.City, input.RecvInfo.Town, input.RecvInfo.Street, input.RecvInfo.AddressDetail, input.RecvInfo.Postcode);
            order.SetRecvInfo(recvInfo);
            order.Seller = input.Seller;
            order.ExtraInfo = input.ExtraInfo;
            order.Remark = input.Remark;
            order.ClearDetail();
            input.Details.ForEach(item =>
            {
                var detail = new SaleDetail(GuidGenerator.Create(), item.Sku, item.Quantity, item.GiveQuantity, item.PlacePrice);
                order.AddInboundDetail(detail);
            });
            order.PlaceTotalPrice = Math.Round(order.Details.Sum(e => e.PlacePrice * e.Quantity), 2);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 确认
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPost]
        public async Task ConfirmAsync(Guid id, ConfirmInput input)
        {
            var order = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }
            order.Confirm(input.TotalPrice);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 取消确认
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPost]
        public async Task UnconfirmAsync(Guid id)
        {
            var order = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }
            order.Unconfirm();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 驳回
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPost]
        public async Task RejectAsync(Guid id, RejectInput input)
        {
            var order = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }
            order.Reject(input.RejectReason);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 处理中
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPost]
        public async Task ProcessingAsync(Guid id)
        {
            var order = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.Processing();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 已收货
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPost]
        public async Task Completed(Guid id)
        {
            var order = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.Completed();
            await StockManager.ForClientOrder(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 快速处理
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task FastHandleAsync(Guid id, FastHandleInput input)
        {
            var order = (await SaleOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.Confirm(input.TotalPrice);
            order.Processing();
            order.Completed();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPost]
        public async Task Settlement(Guid id)
        {
            var order = await SaleOrderRepository.FindAsync(id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }
            order.Settlement();
        }

        [HttpPut]
        public async Task SetTotalPricePaidAsync(Guid id, SetTotalPricePaidInput input)
        {
            var order = await SaleOrderRepository.FindAsync(id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }
            order.SetTotalPricePaid(input.TotalPricePaid);
        }

        [HttpPut]
        public async Task SetPaymentMethod(Guid id, SetPaymentMethodInput input)
        {
            var entity = await SaleOrderRepository.FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            entity.PaymentMethodId = input.PaymentMethodId;
        }
        #endregion
    }
}
