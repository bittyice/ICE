using Ice.Utils;
using Ice.WMS.Core;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Core.WarehouseTransfers;
using Ice.WMS.Dtos;
using Ice.WMS.WarehouseTransfers.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.WarehouseTransfers
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class WarehouseTransferAppService : WMSAppService
    {
        protected IRepository<WarehouseTransfer, Guid> WarehouseTransferRepository { get; }

        protected WarehouseTransferManager WarehouseTransferManager { get; }

        protected OutboundOrderManager OutboundOrderManager { get; }

        protected InboundOrderManager InboundOrderManager { get; }

        public IRepository<InboundOrder, Guid> InboundOrderRepository { get; }

        public IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        public WarehouseTransferAppService(
            IRepository<WarehouseTransfer, Guid> warehouseTransferRepository,
            WarehouseTransferManager warehouseTransferManager,
            OutboundOrderManager outboundOrderManager,
            InboundOrderManager inboundOrderManager,
            IRepository<InboundOrder, Guid> inboundOrderRepository,
            IRepository<OutboundOrder, Guid> outboundOrderRepository)
        {
            WarehouseTransferRepository = warehouseTransferRepository;
            WarehouseTransferManager = warehouseTransferManager;
            OutboundOrderManager = outboundOrderManager;
            InboundOrderManager = inboundOrderManager;
            InboundOrderRepository = inboundOrderRepository;
            OutboundOrderRepository = outboundOrderRepository;
        }

        public async Task<PagedResultDto<WarehouseTransferDtoEX>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(WarehouseTransfer.CreationTime)
                && sorting != nameof(WarehouseTransfer.Id)
                && sorting != nameof(WarehouseTransfer.TransferNumber)
                )
            {
                sorting = nameof(WarehouseTransfer.CreationTime);
            }

            IQueryable<WarehouseTransfer> queryable = await WarehouseTransferRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.TransferNumber))
            {
                queryable = queryable.Where(e => e.TransferNumber == input.TransferNumber);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            if (input.OriginWarehouseId != null)
            {
                queryable = queryable.Where(e => e.OriginWarehouseId == input.OriginWarehouseId);
            }

            if (input.DestinationWarehouseId != null)
            {
                queryable = queryable.Where(e => e.DestinationWarehouseId == input.DestinationWarehouseId);
            }

            long count = queryable.Count();
            queryable = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount);
            var inboundquery = (await InboundOrderRepository.GetQueryableAsync());
            var outboundquery = (await OutboundOrderRepository.GetQueryableAsync());
            var list = (from w in queryable
                    join o in outboundquery on w.OutboundOrderId equals o.Id
                    join i in inboundquery on w.InboundOrderId equals i.Id into tempi
                    from inull in tempi.DefaultIfEmpty()
                    select new WarehouseTransferDtoEX()
                    {
                        Id = w.Id,
                        TransferNumber = w.TransferNumber,
                        OriginWarehouseId = w.OriginWarehouseId,
                        OutboundOrderId = w.OutboundOrderId,
                        DestinationWarehouseId = w.DestinationWarehouseId,
                        InboundOrderId = w.InboundOrderId,
                        CreationTime = w.CreationTime,
                        CreatorId = w.CreatorId,
                        OutboundOrderNumber = o.OutboundNumber,
                        OutboundOrderStatus = o.Status,
                        InboundOrderNumber = inull.InboundNumber,
                        InboundOrderStatus = inull.Status,
                    }).ToList();
            
            list.ForEach(item => {
                item.CreationTime = new DateTimeOffset(item.CreationTime.DateTime);
            });

            return new PagedResultDto<WarehouseTransferDtoEX>(
                count,
                list
            );
        }

        public async Task<WarehouseTransferDto> GetAsync(Guid id)
        {
            var entity = (await WarehouseTransferRepository.GetQueryableAsync()).FirstOrDefault(e => e.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<WarehouseTransfer, WarehouseTransferDto>(entity);
        }

        /// <summary>
        /// 创建调拨任务
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task CreateAsync(CreateInput input)
        {
            if (input.OutboundDetails.Count == 0)
            {
                throw new UserFriendlyException(message: "请添加产品明细");
            }

            if (input.OriginWarehouseId == input.DestinationWarehouseId) 
            {
                throw new UserFriendlyException(message: "始发仓和目的仓不能相同");
            }

            var outboundOrder = new OutboundOrder(GuidGenerator.Create(), Tool.CommonOrderNumberCreate(), OutboundOrderType.Transfer, input.OriginWarehouseId, CurrentTenant.Id.Value);
            outboundOrder.RecvContact = input.RecvContact;
            outboundOrder.RecvContactNumber = input.RecvContactNumber;
            outboundOrder.RecvProvince = input.RecvProvince;
            outboundOrder.RecvCity = input.RecvCity;
            outboundOrder.RecvTown = input.RecvTown;
            outboundOrder.RecvStreet = input.RecvStreet;
            outboundOrder.RecvAddressDetail = input.RecvAddressDetail;
            outboundOrder.RecvPostcode = input.RecvPostcode;
            input.OutboundDetails.ForEach(item =>
            {
                var outboundDetail = new OutboundDetail(GuidGenerator.Create(), item.Sku, item.Quantity, item.TotalAmount, CurrentTenant.Id.Value);
                outboundOrder.OutboundDetails.Add(outboundDetail);
            });
            await OutboundOrderManager.CreateAsync(outboundOrder);

            var inboundOrder = new InboundOrder(GuidGenerator.Create(), Tool.CommonOrderNumberCreate(), InboundOrderType.Transfer, input.DestinationWarehouseId, CurrentTenant.Id.Value);
            input.OutboundDetails.ForEach(item =>
            {
                var inboundDetail = new InboundDetail(GuidGenerator.Create(), item.Sku, item.Quantity, item.TotalAmount, CurrentTenant.Id.Value);
                inboundOrder.InboundDetails.Add(inboundDetail);
            });
            await InboundOrderManager.CreateAsync(inboundOrder);

            var warehouseTransfer = new WarehouseTransfer(GuidGenerator.Create(), Tool.CommonCodeCreate(), input.OriginWarehouseId, input.DestinationWarehouseId, outboundOrder.Id, inboundOrder.Id, CurrentTenant.Id.Value);
            await WarehouseTransferManager.CreateAsync(warehouseTransfer);

            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
