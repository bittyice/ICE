using Ice.WMS.Core.Delivery100s;
using Ice.WMS.Core.Delivery100ExpressOrders;
using Ice.WMS.Delivery100s.Dtos;
using Ice.WMS.Dtos;
using KD100SDK;
using KD100SDK.Common.Request.Electronic;
using KD100SDK.Common.Request.Label;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Ice.Auth.Filters;
using Ice.Utils;

namespace Ice.WMS.Delivery100s
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class Delivery100AppService : WMSAppService
    {
        protected IRepository<Delivery100, Guid> Delivery100Repository { get; set; }

        protected IRepository<Delivery100ExpressOrder, Guid> ExpressOrderRepository { get; }

        public Delivery100AppService(
            IRepository<Delivery100, Guid> delivery100Repository,
            IRepository<Delivery100ExpressOrder, Guid> expressOrderRepository)
        {
            Delivery100Repository = delivery100Repository;
            ExpressOrderRepository = expressOrderRepository;
        }

        public async Task<List<Delivery100Dto>> GetAllConfigs() {
            var list = await Delivery100Repository.GetListAsync();
            return ObjectMapper.Map<List<Delivery100>, List<Delivery100Dto>>(list);
        }

        public async Task CreateConfigAsync(CreateConfigInput input) {
            var delivery100 = new Delivery100(GuidGenerator.Create(), input.Kuaidicom);
            delivery100.PartnerId = input.PartnerId;
            delivery100.PartnerKey = input.PartnerKey;
            delivery100.PartnerSecret = input.PartnerSecret;
            delivery100.PartnerName = input.PartnerName;
            delivery100.Net = input.Net;
            delivery100.Code = input.Code;
            delivery100.CheckMan = input.CheckMan;
            delivery100.PayType = input.PayType;
            delivery100.ExpType = input.ExpType;
            await Delivery100Repository.InsertAsync(delivery100);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateConfigAsync(Guid deliveryId, UpdateConfigInput input) {
            var delivery100 = await Delivery100Repository.FirstOrDefaultAsync(e => e.Id == deliveryId);
            if (delivery100 == null)
            {
                throw new EntityNotFoundException();
            }
            delivery100.PartnerId = input.PartnerId;
            delivery100.PartnerKey = input.PartnerKey;
            delivery100.PartnerSecret = input.PartnerSecret;
            delivery100.PartnerName = input.PartnerName;
            delivery100.Net = input.Net;
            delivery100.Code = input.Code;
            delivery100.CheckMan = input.CheckMan;
            delivery100.PayType = input.PayType;
            delivery100.ExpType = input.ExpType;
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [HttpPut]
        public async Task SetActiveConfigAsync(Guid deliveryId, SetActiveConfigInput input)
        {
            var delivery100 = await Delivery100Repository.FirstOrDefaultAsync(e => e.Id == deliveryId);
            if (delivery100 == null)
            {
                throw new EntityNotFoundException();
            }

            delivery100.IsActive = input.IsActive;
        }

        [HttpPut]
        public async Task SetDefaultConfigAsync(Guid deliveryId)
        {
            var olddelivery100s = await Delivery100Repository.GetListAsync(e => e.IsDefault == true);
            olddelivery100s.ForEach(item =>
            {
                item.IsDefault = false;
            });

            var delivery100 = await Delivery100Repository.FirstOrDefaultAsync(e => e.Id == deliveryId);
            if (delivery100 == null)
            {
                throw new EntityNotFoundException();
            }
            delivery100.IsDefault = true;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 打单
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [AccessLimit(400, 86400, "Delivery100_LabelOrder")]
        [AmountLimit(0)]
        public async Task<Delivery100ExpressOrderDto> LabelOrder(LabelOrderInput input) {
            var expressOrder = (await ExpressOrderRepository.GetQueryableAsync()).OrderByDescending(e => e.CreationTime).FirstOrDefault(e => e.OrderNumber == input.OrderNumber && e.IsCancel == false);
            if (expressOrder != null)
            {
                return ObjectMapper.Map<Delivery100ExpressOrder, Delivery100ExpressOrderDto>(expressOrder);
            }

            var delivery100 = await Delivery100Repository.FirstOrDefaultAsync(e => e.Id == input.DeliveryId);
            if (delivery100 == null)
            {
                throw new EntityNotFoundException();
            }

            var apis = new KD100API();
            var respone = apis.LabelOrder(new OrderParam()
            {
                kuaidicom = delivery100.Kuaidicom,
                partnerId = delivery100.PartnerId,
                partnerKey = delivery100.PartnerKey,
                partnerSecret = delivery100.PartnerSecret,
                partnerName = delivery100.PartnerName,
                net = delivery100.Net,
                code = delivery100.Code,
                checkMan = delivery100.CheckMan,
                payType = input.PayType,
                expType = input.ExpType,
                cargo = input.Cargo,
                sendMan = new ManInfo()
                {
                    name = input.Sender.Name,
                    mobile = input.Sender.Mobile,
                    printAddr = input.Sender.Address,
                },
                recMan = new ManInfo()
                {
                    name = input.Receiver.Name,
                    mobile = input.Receiver.Mobile,
                    printAddr = input.Receiver.Address,
                },
                thirdOrderId = null,
                oaid = null,
                count = 1,
                siid = null,
                tempId = WebConfiguration.KD100Templetes.GetValueOrDefault(delivery100.Kuaidicom),
                printType = "IMAGE",
                // mock = "kd100@Mock"
            });

            if (respone.result == false)
            {
                throw new UserFriendlyException(respone.message);
            }

            expressOrder = new Delivery100ExpressOrder(GuidGenerator.Create())
            {
                ShipperCode = delivery100.Kuaidicom,
                ExpressNumber = respone.data.kuaidinum,
                ShipperOrderNumber = respone.data.kdComOrderNum,
                OrderNumber = input.OrderNumber,
                PrintTemplate = respone.data.label,
                TPInfo = System.Text.Json.JsonSerializer.Serialize(respone.data)
            };

            await ExpressOrderRepository.InsertAsync(expressOrder);
            await CurrentUnitOfWork.SaveChangesAsync();
            return ObjectMapper.Map<Delivery100ExpressOrder, Delivery100ExpressOrderDto>(expressOrder);
        }

        /// <summary>
        /// 取消面单
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task LabelCancel(LabelCancelInput input) {
            var expressOrder = (await ExpressOrderRepository.GetQueryableAsync()).OrderByDescending(e => e.CreationTime).FirstOrDefault(e => e.OrderNumber == input.OrderNumber && e.IsCancel == false);
            if (expressOrder == null)
            {
                throw new UserFriendlyException(message: "无效的快递单号");
            }

            var delivery100 = await Delivery100Repository.FirstOrDefaultAsync(e => e.Kuaidicom == expressOrder.ShipperCode);
            if (delivery100 == null)
            {
                throw new EntityNotFoundException();
            }

            var apis = new KD100API();
            var respone = apis.LabelCancel(new CancelPrintParam()
            {
                kuaidicom = delivery100.Kuaidicom,
                partnerId = delivery100.PartnerId,
                partnerKey = delivery100.PartnerKey,
                partnerSecret = delivery100.PartnerSecret,
                partnerName = delivery100.PartnerName,
                net = delivery100.Net,
                code = delivery100.Code,
                orderId = expressOrder.ShipperOrderNumber,
                kuaidinum = expressOrder.ExpressNumber,
                reason = null,
                // mock = "kd100@Mock"
            });

            if (respone.result == false)
            {
                throw new UserFriendlyException(respone.message);
            }

            expressOrder.IsCancel = true;
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
