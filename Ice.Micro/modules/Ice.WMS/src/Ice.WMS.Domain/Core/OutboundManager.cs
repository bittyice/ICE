using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Core.PickLists;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using System.Linq;
using Volo.Abp;
using Volo.Abp.Guids;
using Volo.Abp.Users;
using Ice.WMS.Core.Locations;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.WarehouseTransfers;
using Volo.Abp.EventBus.Distributed;
using Volo.Abp.EventBus.Local;
using Ice.WMS.Core.Warehouses;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Uow;
using Microsoft.Extensions.Logging;
using Volo.Abp.MultiTenancy;

namespace Ice.WMS.Core
{
    public class OutboundManager : IDomainService
    {
        protected IRepository<OutboundOrder, Guid> OutboundOrderRepository { get; }

        protected IRepository<PickList, Guid> PickListRepository { get; }

        protected IRepository<Location, Guid> LocationRepository { get; }

        protected OutboundOrderManager OutboundOrderManager { get; }

        protected PickListManager PickListManager { get; }

        protected LocationManager LocationManager { get; }

        protected IServiceProvider ServiceProvider { get; }

        protected IGuidGenerator GuidGenerator { get; }

        protected ICurrentUser CurrentUser { get; }

        protected ICurrentTenant CurrentTenant { get; }

        public OutboundManager(IRepository<OutboundOrder, Guid> outboundOrderRepository,
            IRepository<PickList, Guid> pickListRepository,
            IRepository<Location, Guid> locationRepository,
            OutboundOrderManager outboundOrderManager,
            PickListManager pickListManager,
            LocationManager locationManager,
            IServiceProvider serviceProvider,
            IGuidGenerator guidGenerator,
            ICurrentUser currentUser,
            ICurrentTenant currentTenant)
        {
            OutboundOrderRepository = outboundOrderRepository;
            PickListRepository = pickListRepository;
            LocationRepository = locationRepository;
            OutboundOrderManager = outboundOrderManager;
            PickListManager = pickListManager;
            LocationManager = locationManager;
            ServiceProvider = serviceProvider;
            GuidGenerator = guidGenerator;
            CurrentUser = currentUser;
            CurrentTenant = currentTenant;
        }
        
        /// <summary>
        /// 创建出库单
        /// </summary>
        /// <param name="outboundOrder"></param>
        /// <returns></returns>
        public async Task CreateAsync(OutboundOrder outboundOrder) {
            await OutboundOrderManager.CreateAsync(outboundOrder);
        }

        /// <summary>
        /// 快速拣货
        /// </summary>
        /// <param name="outboundOrderId"></param>
        /// <param name="locationCode"></param>
        /// <returns></returns>
        public async Task FastPickAsync(Guid outboundOrderId, string locationCode) {
            var outboundOrder = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == outboundOrderId);
            if (outboundOrder == null)
            {
                throw new EntityNotFoundException();
            }
            var location = (await LocationRepository.WithDetailsAsync(e => e.LocationDetails)).FirstOrDefault(e => e.Code == locationCode && e.WarehouseId == outboundOrder.WarehouseId);
            if (location == null) {
                throw new UserFriendlyException("无效的库位编码");
            }

            outboundOrder.ToPicking(null);
            foreach (var item in outboundOrder.OutboundDetails)
            {
                outboundOrder.Pick(item.Sku, item.Quantity);
                await LocationManager.OffShelf(location, item.Sku, item.Quantity, outboundOrder.Id);
            }
            outboundOrder.ToTobeOut();
        }

        /// <summary>
        /// 生成拣货单
        /// </summary>
        /// <param name="outboundOrderId"></param>
        /// <returns></returns>
        public async Task<Guid> CreatePickListAsync(ICollection<Guid> outboundOrderIds, string pickListNumber) {
            var outboundOrders = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).Where(e => outboundOrderIds.Contains(e.Id)).ToList();
            if (outboundOrders.Count != outboundOrderIds.Count()) {
                throw new UserFriendlyException(message: "生成拣货单失败，无效的订单ID");
            }

            var warehouseId = outboundOrders[0].WarehouseId;
            if (outboundOrders.Any(e => e.WarehouseId != warehouseId)) {
                throw new UserFriendlyException(message: "生成拣货单失败，请选择同一仓库的订单");
            }

            // 生成拣货单
            var pickList = new PickList(GuidGenerator.Create(), pickListNumber, outboundOrderIds.Count, warehouseId, CurrentTenant.Id.Value);
            await PickListManager.CreateAsync(pickList);
            foreach (var outboundOrder in outboundOrders)
            {
                outboundOrder.ToPicking(pickList.Id);
            }
            return pickList.Id;
        }

        /// <summary>
        /// 拣货
        /// </summary>
        /// <param name="outboundOrderId"></param>
        /// <param name="sku"></param>
        /// <param name="pickQuantity"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task PickAsync(Guid outboundOrderId, string locationCode, string sku, int pickQuantity)
        {
            var outboundOrder = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == outboundOrderId);
            if (outboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            outboundOrder.Pick(sku, pickQuantity);
            await LocationManager.OffShelf(outboundOrder.WarehouseId, locationCode, sku, pickQuantity, outboundOrder.Id);
        }

        /// <summary>
        /// 批量拣货
        /// </summary>
        /// <param name="outboundOrderId"></param>
        /// <param name="batchPickSkus"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task BatchPickAsync(IEnumerable<BatchPickSku> batchPickSkus) {
            var group = batchPickSkus.GroupBy(e => e.OutboundOrderId);
            foreach (var groupItem in group) {
                var outboundOrder = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == groupItem.Key);
                if (outboundOrder == null)
                {
                    throw new EntityNotFoundException();
                }

                foreach (var item in groupItem)
                {
                    outboundOrder.Pick(item.Sku, item.Quantity);
                    await LocationManager.OffShelf(outboundOrder.WarehouseId, item.LocationCode, item.Sku, item.Quantity, outboundOrder.Id);
                }
            }
        }

        /// <summary>
        /// 拣货完成
        /// </summary>
        /// <returns></returns>
        public async Task PickDoneOfPicking(Guid pickListId) {
            var pickList = await PickListRepository.FirstOrDefaultAsync(e => e.Id == pickListId);
            if (pickList == null)
            {
                throw new EntityNotFoundException();
            }
            pickList.ToPickingDone();

            var outboundOrders = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).Where(e => e.PickListId == pickListId).ToList();
            foreach (var outboundOrder in outboundOrders) {
                outboundOrder.ToTobeOut();
            }
        }

        /// <summary>
        /// 拣货单出库，将拣货单关联的出库单出库
        /// </summary>
        /// <param name="pickListId"></param>
        /// <returns></returns>
        public async Task OutofstockOfPickList(Guid pickListId) {
            var outboundOrders = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).Where(e => e.PickListId == pickListId).ToList();
            foreach (var outboundOrder in outboundOrders)
            {
                outboundOrder.ToOutofstock();
            }
        }

        /// <summary>
        /// 复核
        /// </summary>
        /// <param name="outboundOrderId"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task ReviewAsync(Guid outboundOrderId)
        {
            var outboundOrder = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == outboundOrderId);
            if (outboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            outboundOrder.Review();
        }

        /// <summary>
        /// 出库
        /// </summary>
        /// <param name="outboundOrderId"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task OutofstockAsync(Guid outboundOrderId) {
            var outboundOrder = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == outboundOrderId);
            if (outboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            outboundOrder.ToOutofstock();
        }

        /// <summary>
        /// 作废出库单
        /// </summary>
        /// <param name="outboundOrderId"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task InvalidAsync(Guid outboundOrderId)
        {
            var outboundOrder = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == outboundOrderId);
            if (outboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            outboundOrder.Invalid();
        }

        /// <summary>
        /// 删除出库单
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task DeleteAsync(Guid id)
        {
            var outboundOrder = (await OutboundOrderRepository.WithDetailsAsync(e => e.OutboundDetails)).FirstOrDefault(e => e.Id == id);
            if (outboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            await OutboundOrderManager.DeleteAsync(outboundOrder);
        }
    }

    public class BatchPickSku
    {
        public Guid OutboundOrderId { get; set; }

        public string LocationCode { get; set; }

        public string Sku { get; set; }

        public int Quantity { get; set; }
    }
}
