using Ice.WMS.Core.LossReportOrders;
using Ice.WMS.Dtos;
using Ice.WMS.LossReportOrders.Dtos;
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
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;

namespace Ice.WMS.LossReportOrders
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class LossReportOrderAppService : WMSAppService
    {
        protected IRepository<LossReportOrder, Guid> LossReportOrderRepository { get; }

        protected LossReportOrderManager LossReportOrderManager { get; }

        public LossReportOrderAppService(
            IRepository<LossReportOrder, Guid> lossReportOrderRepository,
            LossReportOrderManager lossReportOrderManager)
        {
            LossReportOrderRepository = lossReportOrderRepository;
            LossReportOrderManager = lossReportOrderManager;
        }

        public async Task<PagedResultDto<LossReportOrderDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(LossReportOrder.CreationTime)
                && sorting != nameof(LossReportOrder.OrderNumber)
                )
            {
                sorting = nameof(LossReportOrder.CreationTime);
            }

            IQueryable<LossReportOrder> queryable = await LossReportOrderRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.OrderNumber))
            {
                queryable = queryable.Where(e => e.OrderNumber == input.OrderNumber);
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
            List<LossReportOrder> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<LossReportOrderDto>(
                count,
                ObjectMapper.Map<List<LossReportOrder>, List<LossReportOrderDto>>(list)
            );
        }

        public async Task<List<LossReportOrderDto>> GetForIdsAsync(GetListForIdsInput input) {
            if (input.Ids.Count == 0) {
                return new List<LossReportOrderDto>();
            }

            var list = (await LossReportOrderRepository.WithDetailsAsync(e => e.Details)).Where(e => input.Ids.Contains(e.Id)).ToList();
            return ObjectMapper.Map<List<LossReportOrder>, List<LossReportOrderDto>>(list);
        }

        public async Task<LossReportOrderDto> GetAsync(Guid id)
        {
            var entity = (await LossReportOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<LossReportOrder, LossReportOrderDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            if (input.Details.Count == 0)
            {
                throw new UserFriendlyException(message: "请添加产品明细");
            }

            var order = new LossReportOrder(GuidGenerator.Create(), input.OrderNumber, input.WarehouseId, CurrentTenant.Id.Value);
            order.ExtraInfo = input.ExtraInfo;
            input.Details.ForEach(item =>
            {
                var detail = new LossReportDetail(GuidGenerator.Create(), item.Sku, item.Quantity, CurrentTenant.Id.Value);
                order.AddDetail(detail);
            });
            await LossReportOrderManager.CreateAsync(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            if (input.Details.Count == 0)
            {
                throw new UserFriendlyException(message: "请添加产品明细");
            }

            var order = (await LossReportOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            order.ExtraInfo = input.ExtraInfo;
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.ClearDetail();
            input.Details.ForEach(item =>
            {
                var detail = new LossReportDetail(GuidGenerator.Create(), item.Sku, item.Quantity, CurrentTenant.Id.Value);
                order.AddDetail(detail);
            });

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 已处理
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task ToProcessedAsync(Guid id) {
            var order = (await LossReportOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.ToProcessed();
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
            var order = (await LossReportOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            order.Invalid();
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 删除
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task DeleteAsync(Guid id)
        {
            var order = (await LossReportOrderRepository.WithDetailsAsync(e => e.Details)).FirstOrDefault(e => e.Id == id);
            if (order == null)
            {
                throw new EntityNotFoundException();
            }

            await LossReportOrderManager.DeleteAsync(order);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
