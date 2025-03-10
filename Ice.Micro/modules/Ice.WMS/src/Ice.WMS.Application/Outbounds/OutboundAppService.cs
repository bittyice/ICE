using Ice.WMS.Core;
using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Core.PickLists;
using Ice.WMS.Dtos;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Ice.WMS.Outbounds.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp;
using Microsoft.AspNetCore.Mvc;
using Ice.Utils;
using Ice.WMS.Core.Delivery100ExpressOrders;

namespace Ice.WMS.Outbounds
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class OutboundAppService : WMSAppService
    {
        protected OutboundManager OutboundManager { get; }

        protected IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        protected IRepository<Delivery100ExpressOrder, Guid> Delivery100ExpressOrderRepository { get; }

        protected IRepository<PickList, Guid> PickListRepository { get; }

        public OutboundAppService(
            OutboundManager outboundManager,
            IRepository<OutboundOrder, Guid> outboundOrderRepository,
            IRepository<Delivery100ExpressOrder, Guid> delivery100ExpressOrderRepository,
            IRepository<PickList, Guid> pickListRepository)
        {
            OutboundManager = outboundManager;
            OutboundOrderRepository = outboundOrderRepository;
            Delivery100ExpressOrderRepository = delivery100ExpressOrderRepository;
            PickListRepository = pickListRepository;
        }

        #region 出库单
        public async Task<PagedResultDto<GetListOutputItem>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(OutboundOrder.CreationTime)
                && sorting != nameof(OutboundOrder.Id)
                && sorting != nameof(OutboundOrder.OutboundNumber)
                && sorting != nameof(OutboundOrder.Status)
                && sorting != nameof(OutboundOrder.WarehouseId)
                && sorting != nameof(OutboundOrder.PickListId)
                )
            {
                sorting = nameof(OutboundOrder.CreationTime);
            }

            IQueryable<OutboundOrder> queryable = await OutboundOrderRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.OutboundNumber))
            {
                queryable = queryable.Where(e => e.OutboundNumber == input.OutboundNumber);
            }

            if (!string.IsNullOrWhiteSpace(input.RecvContact))
            {
                queryable = queryable.Where(e => e.RecvContact == input.RecvContact);
            }

            if (!string.IsNullOrWhiteSpace(input.RecvContactNumber))
            {
                queryable = queryable.Where(e => e.RecvContactNumber == input.RecvContactNumber);
            }

            if (!string.IsNullOrWhiteSpace(input.Area))
            {
                var areas = input.Area.Split("-");
                if (areas.Length > 0 && !string.IsNullOrEmpty(areas[0]))
                {
                    queryable = queryable.Where(e => e.RecvProvince == areas[0]);
                }
                if (areas.Length > 1 && !string.IsNullOrEmpty(areas[1]))
                {
                    queryable = queryable.Where(e => e.RecvCity == areas[1]);
                }
                if (areas.Length > 2 && !string.IsNullOrEmpty(areas[2]))
                {
                    queryable = queryable.Where(e => e.RecvTown == areas[2]);
                }
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

            if (input.OrderType != null)
            {
                queryable = queryable.Where(e => e.OrderType == input.OrderType);
            }

            if (input.Reviewed != null)
            {
                queryable = queryable.Where(e => e.Reviewed == input.Reviewed);
            }

            if (input.PickListId != null)
            {
                queryable = queryable.Where(e => e.PickListId == input.PickListId);
            }

            long count = queryable.Count();
            queryable = queryable
            .IceOrderBy(sorting, input.SortDirection == "descend")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount);

            var expressOrders = (await Delivery100ExpressOrderRepository.GetQueryableAsync()).Where(e => e.IsCancel == false);
            var list = (from e in queryable
                        join expressOrder in expressOrders on e.OutboundNumber equals expressOrder.OrderNumber into expressOrderTemp
                        from newExpressOrder in expressOrderTemp.DefaultIfEmpty()
                        select new GetListOutputItem()
                        {
                            Id = e.Id,
                            OutboundNumber = e.OutboundNumber,
                            OrderType = e.OrderType,
                            RecvContact = e.RecvContact,
                            RecvContactNumber = e.RecvContactNumber,
                            RecvProvince = e.RecvProvince,
                            RecvCity = e.RecvCity,
                            RecvTown = e.RecvTown,
                            RecvStreet = e.RecvStreet,
                            RecvAddressDetail = e.RecvAddressDetail,
                            RecvPostcode = e.RecvPostcode,
                            Status = e.Status,
                            Reviewed = e.Reviewed,
                            WarehouseId = e.WarehouseId,
                            Remark = e.Remark,
                            PickListId = e.PickListId,
                            ExtraInfo = e.ExtraInfo,
                            CreationTime = e.CreationTime,
                            OtherInfo = e.OtherInfo,
                            IsPushTMS = e.IsPushTMS,
                            SkuTotalQuantity = e.OutboundDetails.Sum(ie => ie.Quantity),
                            ShipperCode = newExpressOrder.ShipperCode,
                            ExpressNumber = newExpressOrder.ExpressNumber,
                        }).ToList();

            list.ForEach(item =>
            {
                item.CreationTime = new DateTimeOffset(item.CreationTime.DateTime);
            });

            return new PagedResultDto<GetListOutputItem>(
                count,
                list
            );
        }

        public async Task<List<OutboundOrderDto>> GetListWithDetailsAsync(GetListWithDetailsInput input)
        {
            List<OutboundOrder> list = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).Where(e => input.Ids.Contains(e.Id)).ToList();
            return ObjectMapper.Map<List<OutboundOrder>, List<OutboundOrderDto>>(list);
        }

        public async Task<List<OutboundOrderDto>> GetListWithDetailsForPickIdAsync(Guid pickListId)
        {
            List<OutboundOrder> list = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).Where(e => e.PickListId == pickListId).ToList();
            return ObjectMapper.Map<List<OutboundOrder>, List<OutboundOrderDto>>(list);
        }

        public async Task<long> GetCountAsync(GetCountInput input)
        {
            IQueryable<OutboundOrder> queryable = await OutboundOrderRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

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

            return count;
        }

        public async Task<OutboundOrderDto> GetAsync(Guid id)
        {
            var entity = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<OutboundOrder, OutboundOrderDto>(entity);
        }

        public async Task<OutboundOrderDto> GetForNumberAsync(GetForNumberInput input)
        {
            var entity = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.OutboundNumber == input.OutboundNumber && e.WarehouseId == input.WarehouseId);
            if (entity == null)
            {
                throw new UserFriendlyException("无效的出库单号");
            }

            return ObjectMapper.Map<OutboundOrder, OutboundOrderDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            string orderNumber = null;
            if (input.OrderType == OutboundOrderType.Sale || input.OrderType == OutboundOrderType.PurchaseReturn)
            {
                orderNumber = input.OutboundNumber;
            }
            else if (input.OrderType == OutboundOrderType.Customize)
            {
                orderNumber = Tool.CommonOrderNumberCreate();
            }
            else
            {
                throw new UserFriendlyException("不允许创建其他类型的订单");
            }

            var outboundOrder = new OutboundOrder(GuidGenerator.Create(), orderNumber, input.OrderType, input.WarehouseId, CurrentTenant.Id.Value);
            outboundOrder.RecvContact = input.RecvContact;
            outboundOrder.RecvContactNumber = input.RecvContactNumber;
            outboundOrder.RecvProvince = input.RecvProvince;
            outboundOrder.RecvCity = input.RecvCity;
            outboundOrder.RecvTown = input.RecvTown;
            outboundOrder.RecvStreet = input.RecvStreet;
            outboundOrder.RecvAddressDetail = input.RecvAddressDetail;
            outboundOrder.RecvPostcode = input.RecvPostcode;
            outboundOrder.ExtraInfo = input.ExtraInfo;
            outboundOrder.Remark = input.Remark;
            outboundOrder.OtherInfo = input.OtherInfo;
            input.OutboundDetails.ForEach(item =>
            {
                var outboundDetail = new OutboundDetail(GuidGenerator.Create(), item.Sku, item.Quantity, item.TotalAmount, CurrentTenant.Id.Value);
                outboundOrder.OutboundDetails.Add(outboundDetail);
            });
            await OutboundManager.CreateAsync(outboundOrder);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 更新
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            if (input.OutboundDetails.Count == 0)
            {
                throw new UserFriendlyException(message: "请添加产品明细");
            }

            var outboundOrder = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == id);
            if (outboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            outboundOrder.RecvContact = input.RecvContact;
            outboundOrder.RecvContactNumber = input.RecvContactNumber;
            outboundOrder.RecvProvince = input.RecvProvince;
            outboundOrder.RecvCity = input.RecvCity;
            outboundOrder.RecvTown = input.RecvTown;
            outboundOrder.RecvStreet = input.RecvStreet;
            outboundOrder.RecvAddressDetail = input.RecvAddressDetail;
            outboundOrder.RecvPostcode = input.RecvPostcode;
            outboundOrder.ExtraInfo = input.ExtraInfo;
            outboundOrder.Remark = input.Remark;
            outboundOrder.OtherInfo = input.OtherInfo;
            outboundOrder.ClearOutboundDetail();
            input.OutboundDetails.ForEach(item =>
            {
                var outboundDetail = new OutboundDetail(GuidGenerator.Create(), item.Sku, item.Quantity, item.TotalAmount, CurrentTenant.Id.Value);
                outboundOrder.OutboundDetails.Add(outboundDetail);
            });

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 快速拣货
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        public async Task FastPickAsync(Guid id, FastPickInput input)
        {
            await OutboundManager.FastPickAsync(id, input.LocationCode);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 拣货
        /// </summary>
        /// <param name="id"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task PickAsync(Guid id, PickInput input)
        {
            await OutboundManager.PickAsync(id, input.LocationCode, input.Sku, input.Quantity);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 批量拣货
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        public async Task BatchPickAsync(BatchPickInput input)
        {
            await OutboundManager.BatchPickAsync(input.Items);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 复核
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task ReviewAsync(Guid id)
        {
            await OutboundManager.ReviewAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 出库
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task OutofstockAsync(Guid id)
        {
            await OutboundManager.OutofstockAsync(id);
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
            await OutboundManager.InvalidAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
        #endregion

        #region 拣货单
        public async Task<PagedResultDto<PickListDto>> GetPickListAsync(GetPickListListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(PickList.CreationTime)
                && sorting != nameof(PickList.Id)
                && sorting != nameof(PickList.PickListNumber)
                && sorting != nameof(PickList.Status)
                && sorting != nameof(PickList.WarehouseId)
                )
            {
                sorting = nameof(PickList.CreationTime);
            }

            IQueryable<PickList> queryable = await PickListRepository.GetQueryableAsync();
            queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.PickListNumber))
            {
                queryable = queryable.Where(e => e.PickListNumber == input.PickListNumber);
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
            List<PickList> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<PickListDto>(
                count,
                ObjectMapper.Map<List<PickList>, List<PickListDto>>(list)
            );
        }

        [Route("/api/wms/outbound/pick-list/{id}")]
        public async Task<PickListDto> GetPickListAsync(Guid id)
        {
            var entity = await PickListRepository.FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<PickList, PickListDto>(entity);
        }

        [Route("/api/wms/outbound/pick-list-for-number")]
        public async Task<PickListDto> GetPickListForNumberAsync(GetPickListForNumberInput input)
        {
            var entity = await PickListRepository.FirstOrDefaultAsync(e => e.PickListNumber == input.PickListNumber && e.WarehouseId == input.WarehouseId);
            if (entity == null)
            {
                throw new UserFriendlyException("无效的拣货单号");
            }

            return ObjectMapper.Map<PickList, PickListDto>(entity);
        }

        /// <summary>
        /// 创建拣货单
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<Guid> CreatePickListAsync(CreatePickListInput input)
        {
            return await OutboundManager.CreatePickListAsync(input.OutboundOrderIds, input.PickListNumber);
        }

        /// <summary>
        /// 拣货完成
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("/api/wms/outbound/picking-done/{id}")]
        public async Task PickingDone(Guid id)
        {
            await OutboundManager.PickDoneOfPicking(id);
        }

        /// <summary>
        /// 拣货单出库
        /// </summary>
        /// <param name="pickListId"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task OutofstockOfPickListAsync(Guid pickListId)
        {
            await OutboundManager.OutofstockOfPickList(pickListId);
        }
        #endregion
    }
}
