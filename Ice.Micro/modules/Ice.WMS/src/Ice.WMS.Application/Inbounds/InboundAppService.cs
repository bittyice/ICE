using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Dtos;
using Ice.WMS.Inbounds.Dtos;
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
using Ice.WMS.Core;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;

namespace Ice.WMS.Inbounds
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class InboundAppService : WMSAppService
    {
        protected IRepository<InboundOrder, Guid> InboundOrderRepository { get; }

        protected InboundManager InboundManager { get; }

        public InboundAppService(
            IRepository<InboundOrder, Guid> inboundOrderRepository,
            InboundManager inboundManager)
        {
            InboundOrderRepository = inboundOrderRepository;
            InboundManager = inboundManager;
        }

        public async Task<PagedResultDto<InboundOrderDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(InboundOrder.CreationTime)
                && sorting != nameof(InboundOrder.Id)
                && sorting != nameof(InboundOrder.InboundNumber)
                && sorting != nameof(InboundOrder.InboundBatch)
                )
            {
                sorting = nameof(InboundOrder.CreationTime);
            }

            IQueryable<InboundOrder> queryable = await InboundOrderRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.InboundNumber))
            {
                queryable = queryable.Where(e => e.InboundNumber == input.InboundNumber);
            }

            if (!string.IsNullOrWhiteSpace(input.InboundBatch))
            {
                queryable = queryable.Where(e => e.InboundBatch == input.InboundBatch);
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
            List<InboundOrder> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<InboundOrderDto>(
                count,
                ObjectMapper.Map<List<InboundOrder>, List<InboundOrderDto>>(list)
            );
        }

        public async Task<InboundOrderDto> GetAsync(Guid id)
        {
            var entity = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<InboundOrder, InboundOrderDto>(entity);
        }

        public async Task<InboundOrderDto> GetForNumberAsync(GetForNumberInput input)
        {
            var entity = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.WarehouseId == input.WarehouseId && e.InboundNumber == input.InboundNumber);
            if (entity == null)
            {
                throw new UserFriendlyException("无效的入库单号");
            }

            return ObjectMapper.Map<InboundOrder, InboundOrderDto>(entity);
        }

        public async Task<List<InboundOrderDto>> GetListWithDetailAsync(Guid[] ids)
        {
            if (ids.Length == 0)
            {
                return new List<InboundOrderDto>();
            }

            var list = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).Where(e => ids.Contains(e.Id)).ToList();
            return ObjectMapper.Map<List<InboundOrder>, List<InboundOrderDto>>(list);
        }

        public async Task CreateAsync(CreateInput input)
        {
            string orderNumber = null;
            if (input.Type == InboundOrderType.Purchase || input.Type == InboundOrderType.SaleReturn)
            {
                orderNumber = input.InboundNumber;
            }
            else if (input.Type == InboundOrderType.Customize)
            {
                orderNumber = Tool.CommonOrderNumberCreate();
            }
            else
            {
                throw new UserFriendlyException("不允许创建其他类型的订单");
            }

            var inboundOrder = new InboundOrder(GuidGenerator.Create(), orderNumber, input.Type, input.WarehouseId, CurrentTenant.Id.Value);
            inboundOrder.InboundBatch = input.InboundBatch;
            inboundOrder.ExtraInfo = input.ExtraInfo;
            inboundOrder.Remark = input.Remark;
            inboundOrder.OtherInfo = input.OtherInfo;
            input.InboundDetails.ForEach(item =>
            {
                var inboundDetail = new InboundDetail(GuidGenerator.Create(), item.Sku, item.ForecastQuantity, item.TotalAmount, CurrentTenant.Id.Value);
                inboundDetail.ShelfLise = item.ShelfLise?.LocalDateTime;
                inboundDetail.Remark = item.Remark;
                inboundOrder.AddInboundDetail(inboundDetail);
            });
            await InboundManager.CreateAsync(inboundOrder);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var inboundOrder = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == id);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            inboundOrder.InboundBatch = input.InboundBatch;
            inboundOrder.ExtraInfo = input.ExtraInfo;
            inboundOrder.Remark = input.Remark;
            inboundOrder.OtherInfo = input.OtherInfo;
            var oldDetails = inboundOrder.InboundDetails;
            inboundOrder.ClearInboundDetail();
            input.InboundDetails.ForEach(item =>
            {
                var inboundDetail = new InboundDetail(GuidGenerator.Create(), item.Sku, item.ForecastQuantity, item.TotalAmount, CurrentTenant.Id.Value);
                inboundDetail.ShelfLise = item.ShelfLise?.LocalDateTime;
                inboundDetail.Remark = item.Remark;
                inboundOrder.AddInboundDetail(inboundDetail);
            });

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 收货
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task ReceiptAsync(Guid id)
        {
            await InboundManager.ReceiptAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 查验
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task CheckAsync(Guid id, [FromBody] CheckInput input)
        {
            await InboundManager.CheckAsync(id, input.Sku, input.ActualQuantity, input.ShelfLise?.LocalDateTime);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 去上架
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task ToOnShelfAsync(Guid id)
        {
            await InboundManager.ToOnShelfAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 上架
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task OnShelfAsync(Guid id, [FromBody] OnShelfInput input)
        {
            await InboundManager.OnShlef(id, input.Sku, input.Quantity, input.LocationCode, input.Enforce);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 快速上架
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        public async Task FastOnshlefAsync(Guid id, FastOnshleInput input)
        {
            await InboundManager.FastOnshlef(id, input.LocationCode);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 完成上架
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task FinishOnShelfAsync(Guid id)
        {
            await InboundManager.FinishOnShelfAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
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
            await InboundManager.InvalidAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
