using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.Locations;
using Ice.WMS.Core.WarehouseTransfers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.EventBus.Distributed;
using Volo.Abp.EventBus.Local;
using Volo.Abp.Guids;
using Volo.Abp.Users;

namespace Ice.WMS.Core
{
    public class InboundManager : IDomainService
    {
        protected IRepository<InboundOrder, Guid> InboundOrderRepository { get; }

        protected InboundOrderManager InboundOrderManager { get; }

        protected LocationManager LocationManager { get; }

        protected ILocalEventBus LocalEventBus { get; }

        protected ICurrentUser CurrentUser { get; }

        public InboundManager(
            IRepository<InboundOrder, Guid> inboundOrderRepository,
            InboundOrderManager inboundOrderManager,
            LocationManager locationManager,
            ILocalEventBus localEventBus,
            ICurrentUser currentUser)
        {
            InboundOrderRepository = inboundOrderRepository;
            InboundOrderManager = inboundOrderManager;
            LocationManager = locationManager;
            LocalEventBus = localEventBus;
            CurrentUser = currentUser;
        }

        /// <summary>
        /// 创建
        /// </summary>
        /// <param name="inboundOrder"></param>
        /// <returns></returns>
        public async Task CreateAsync(InboundOrder inboundOrder) {
            await InboundOrderManager.CreateAsync(inboundOrder);
        }

        /// <summary>
        /// 收货（去查验）
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task ReceiptAsync(Guid id)
        {
            var inboundOrder = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == id);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            inboundOrder.ToCheck();
        }

        /// <summary>
        /// 查验
        /// </summary>
        /// <param name="id"></param>
        /// <param name="sku"></param>
        /// <param name="actualQuantity"></param>
        /// <param name="shelfLise"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task CheckAsync(Guid id, string sku, int actualQuantity, DateTime? shelfLise)
        {
            var inboundOrder = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == id);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            inboundOrder.Check(sku, shelfLise, actualQuantity);
        }

        /// <summary>
        /// 去上架
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task ToOnShelfAsync(Guid id)
        {
            var inboundOrder = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == id);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            inboundOrder.ToOnShelf();
        }

        /// <summary>
        /// 上架
        /// </summary>
        /// <param name="inboundOrderId"></param>
        /// <param name="sku"></param>
        /// <param name="quantity"></param>
        /// <param name="locationCode"></param>
        /// <param name="enforce"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task OnShlef(Guid inboundOrderId, string sku, int quantity, string locationCode, bool enforce) {
            var inboundOrder = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == inboundOrderId);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            var inboundDetail = inboundOrder.InboundDetails.FirstOrDefault(e => e.Sku == sku);
            if (inboundDetail == null)
            {
                throw new UserFriendlyException(message: "无效的SKU");
            }

            inboundDetail.OnShelf(quantity);
            await LocationManager.OnShelf(inboundOrder.WarehouseId, locationCode, new OnOffShelfSkuInfo(sku, quantity, inboundOrder.InboundBatch, inboundDetail.ShelfLise), enforce, inboundOrder.Id);
        }

        /// <summary>
        /// 快速上架
        /// </summary>
        /// <returns></returns>
        public async Task FastOnshlef(Guid inboundOrderId, string locationCode) {
            var inboundOrder = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == inboundOrderId);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }
            inboundOrder.ToCheck();
            inboundOrder.SkipCheck();

            List<OnOffShelfSkuInfo> onOffShelfSkuInfos = new List<OnOffShelfSkuInfo>();
            foreach (var inboundDetail in inboundOrder.InboundDetails) {
                int quantity = inboundDetail.ActualQuantity - inboundDetail.ShelvesQuantity;
                inboundDetail.OnShelf(quantity);
                onOffShelfSkuInfos.Add(new OnOffShelfSkuInfo(inboundDetail.Sku, quantity, inboundOrder.InboundBatch, inboundDetail.ShelfLise));
            }
            await LocationManager.OnShelfBatch(inboundOrder.WarehouseId, locationCode, onOffShelfSkuInfos, true, inboundOrder.Id);
            inboundOrder.FinishOnShelf();
        }

        /// <summary>
        /// 完成上架
        /// </summary>
        /// <param name="inboundOrderId"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task FinishOnShelfAsync(Guid inboundOrderId) {
            var inboundOrder = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == inboundOrderId);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }
            inboundOrder.FinishOnShelf();
        }

        /// <summary>
        /// 作废
        /// </summary>
        /// <param name="id"></param>
        /// <param name="enforce"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task InvalidAsync(Guid id)
        {
            var inboundOrder = (await InboundOrderRepository.WithDetailsAsync(e => e.InboundDetails)).FirstOrDefault(e => e.Id == id);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            inboundOrder.Invalid();
        }

        /// <summary>
        /// 删除
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        public async Task DeleteAsync(Guid id) {
            var inboundOrder = await InboundOrderRepository.FirstOrDefaultAsync(e => e.Id == id);
            if (inboundOrder == null)
            {
                throw new EntityNotFoundException();
            }

            await InboundOrderManager.DeleteAsync(inboundOrder);
        }
    }
}
