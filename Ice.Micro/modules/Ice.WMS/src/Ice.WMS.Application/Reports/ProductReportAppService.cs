using Ice.WMS.Reports.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Application.Dtos;
using Ice.WMS.Core.OutboundOrders;
using Ice.WMS.Core.InboundOrders;
using Ice.WMS.Core.LossReportOrders;
using Ice.WMS.Core;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;

namespace Ice.WMS.Reports
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class ProductReportAppService : WMSAppService
    {
        protected IRepository<OutboundDetail> OutboundDetailRepository { get; }

        protected IRepository<OutboundOrder> OutboundOrderRepository { get; }

        protected IRepository<InboundDetail> InboundDetailRepository { get; }

        protected IRepository<InboundOrder> InboundOrderRepository { get; }

        public ProductReportAppService(
            IRepository<OutboundDetail> outboundDetailRepository,
            IRepository<OutboundOrder> outboundOrderRepository,
            IRepository<InboundDetail> inboundDetailRepository,
            IRepository<InboundOrder> inboundOrderRepository)
        {
            OutboundDetailRepository = outboundDetailRepository;
            OutboundOrderRepository = outboundOrderRepository;
            InboundDetailRepository = inboundDetailRepository;
            InboundOrderRepository = inboundOrderRepository;
        }

        public async Task<PagedResultDto<ProductReportOutputItem>> GetOutboundSkuReportAsync(GetOutboundSkuReportInput input) {
            var sorting = nameof(OutboundDetail.Sku);

            IQueryable<OutboundDetail> pdQueryable = await OutboundDetailRepository.GetQueryableAsync();
            IQueryable<OutboundOrder> poQueryable = await OutboundOrderRepository.GetQueryableAsync();

            if (!string.IsNullOrEmpty(input.OrderType))
            {
                poQueryable = poQueryable.Where(e => e.OrderType == input.OrderType);
            }

            IQueryable<ProductReportQueryItem> queryable = pdQueryable.Join(poQueryable, pd => pd.OutboundOrderId, po => po.Id, (pd, po) => new ProductReportQueryItem()
            {
                Sku = pd.Sku,
                Quantity = pd.Quantity,
                Status = (int) po.Status,
                CreationTime = po.CreationTime,
                WarehouseId = po.WarehouseId,
            });

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            if (input.WarehouseId != null)
            {
                queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            var outputQueryable = queryable.GroupBy(e => e.Sku).Select(e => new ProductReportOutputItem()
            {
                Sku = e.Key,
                Total = e.Sum(ie => ie.Quantity),
            });
            long count = outputQueryable.Count();
            List<ProductReportOutputItem> list = outputQueryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<ProductReportOutputItem>(
                count,
                list
            );
        }

        public async Task<List<ProductReportOutputItem>> GetOutboundSkuReportForSkusAsync(GetOutboundSkuReportForSkusInput input) {
            IQueryable<OutboundDetail> pdQueryable = (await OutboundDetailRepository.GetQueryableAsync()).Where(e => input.Skus.Contains(e.Sku));
            IQueryable<OutboundOrder> poQueryable = await OutboundOrderRepository.GetQueryableAsync();

            IQueryable<ProductReportQueryItem> queryable = pdQueryable.Join(poQueryable, pd => pd.OutboundOrderId, po => po.Id, (pd, po) => new ProductReportQueryItem()
            {
                Sku = pd.Sku,
                Quantity = pd.Quantity,
                Status = (int)po.Status,
                CreationTime = po.CreationTime,
                WarehouseId = po.WarehouseId,
            });

            if (input.WarehouseId != null)
            {
                queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            var outputQueryable = queryable.GroupBy(e => e.Sku).Select(e => new ProductReportOutputItem()
            {
                Sku = e.Key,
                Total = e.Sum(ie => ie.Quantity),
            });
            List<ProductReportOutputItem> list = outputQueryable.ToList();

            return list;
        }

        public async Task<PagedResultDto<ProductReportOutputItem>> GetInboundSkuReportAsync(GetInboundSkuReportInput input)
        {
            var sorting = nameof(InboundDetail.Sku);

            IQueryable<InboundDetail> pdQueryable = await InboundDetailRepository.GetQueryableAsync();
            IQueryable<InboundOrder> poQueryable = (await InboundOrderRepository.GetQueryableAsync()).Where(e => e.Status == InboundOrderStatus.Shelfed);

            if (input.Type != null) {
                poQueryable = poQueryable.Where(e => e.Type == input.Type);
            }

            IQueryable<ProductReportQueryItem> queryable = pdQueryable.Join(poQueryable, pd => pd.InboundOrderId, po => po.Id, (pd, po) => new ProductReportQueryItem()
            {
                Sku = pd.Sku,
                Quantity = pd.ShelvesQuantity,
                Status = (int) po.Status,
                CreationTime = po.CreationTime,
                WarehouseId = po.WarehouseId,
            });

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            if (input.WarehouseId != null)
            {
                queryable = queryable.Where(e => e.WarehouseId == input.WarehouseId);
            }

            if (input.Status != null)
            {
                queryable = queryable.Where(e => e.Status == input.Status);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            var outputQueryable = queryable.GroupBy(e => e.Sku).Select(e => new ProductReportOutputItem()
            {
                Sku = e.Key,
                Total = e.Sum(ie => ie.Quantity),
            });
            long count = outputQueryable.Count();
            List<ProductReportOutputItem> list = outputQueryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<ProductReportOutputItem>(
                count,
                list
            );
        }
    }
}
