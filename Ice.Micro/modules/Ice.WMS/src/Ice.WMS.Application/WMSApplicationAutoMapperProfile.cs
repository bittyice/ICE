using System;
using AutoMapper;
using Ice.WMS.Core.Areas;
using Ice.WMS.Core.Delivery100ExpressOrders;
using Ice.WMS.Core.Delivery100s;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.InventoryAlerts;
using Ice.WMS.Core.Locations;
using Ice.WMS.Core.LossReportOrders;
using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Core.PickLists;
using Ice.WMS.Core.StockChangeLogs;
using Ice.WMS.Core.TransferSkus;
using Ice.WMS.Core.WarehouseChecks;
using Ice.WMS.Core.WarehouseMessages;
using Ice.WMS.Core.Warehouses;
using Ice.WMS.Core.WarehouseTransfers;
using Ice.WMS.Dtos;

namespace Ice.WMS;

public class WMSApplicationAutoMapperProfile : Profile
{
    public WMSApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */


        CreateMap<Warehouse, WarehouseDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
                dto.LastModificationTime = entity.LastModificationTime.HasValue ? new DateTimeOffset(entity.LastModificationTime.Value) : null;
            });
        CreateMap<Area, AreaDto>()
            .AfterMap((entity, dto) =>
            {
                dto.LastCheckTime = entity.LastCheckTime.HasValue ? new DateTimeOffset(entity.LastCheckTime.Value) : null;
            });
        CreateMap<Location, LocationDto>();
        CreateMap<LocationDetail, LocationDetailDto>()
            .AfterMap((entity, dto) =>
            {
                dto.ShelfLise = entity.ShelfLise != null ? new DateTimeOffset(entity.ShelfLise.Value) : null;
            });

        CreateMap<InboundDetail, InboundDetailDto>()
            .AfterMap((entity, dto) =>
            {
                dto.ShelfLise = entity.ShelfLise != null ? new DateTimeOffset(entity.ShelfLise.Value) : null;
            });
        CreateMap<InboundOrder, InboundOrderDto>()
            .AfterMap((entity, dto) =>
             {
                 dto.CreationTime = new DateTimeOffset(entity.CreationTime);
                 dto.LastModificationTime = entity.LastModificationTime.HasValue ? new DateTimeOffset(entity.LastModificationTime.Value) : null;
                 dto.FinishTime = entity.FinishTime.HasValue ? new DateTimeOffset(entity.FinishTime.Value) : null;
             });

        CreateMap<OutboundDetail, OutboundDetailDto>();
        CreateMap<OutboundOrder, OutboundOrderDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
                dto.FinishTime = entity.FinishTime.HasValue ? new DateTimeOffset(entity.FinishTime.Value) : null;
            });

        CreateMap<PickList, PickListDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
            });

        CreateMap<WarehouseTransfer, WarehouseTransferDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
            });
        CreateMap<WarehouseCheck, WarehouseCheckDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
                dto.CheckStartTime = entity.CheckStartTime.HasValue ? new DateTimeOffset(entity.CheckStartTime.Value) : null;
                dto.CheckFinishTime = entity.CheckFinishTime.HasValue ? new DateTimeOffset(entity.CheckFinishTime.Value) : null;
            });

        CreateMap<InventoryAlert, InventoryAlertDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
            });
        CreateMap<WarehouseMessage, WarehouseMessageDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
            });

        CreateMap<LossReportOrder, LossReportOrderDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
                dto.LastModificationTime = entity.LastModificationTime.HasValue ? new DateTimeOffset(entity.LastModificationTime.Value) : null;
                dto.DeletionTime = entity.DeletionTime.HasValue ? new DateTimeOffset(entity.DeletionTime.Value) : null;
            });
        CreateMap<LossReportDetail, LossReportDetailDto>();

        CreateMap<TransferSku, TransferSkuDto>();
        CreateMap<StockChangeLog, StockChangeLogDto>()
            .AfterMap((entity, dto) =>
            {
                dto.CreationTime = new DateTimeOffset(entity.CreationTime);
            });
        CreateMap<Delivery100ExpressOrder, Delivery100ExpressOrderDto>();
        CreateMap<Delivery100, Delivery100Dto>();
    }
}
