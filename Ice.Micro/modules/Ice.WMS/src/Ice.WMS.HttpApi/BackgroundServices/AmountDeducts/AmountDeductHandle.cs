
using System;
using System.Threading.Tasks;
using Ice.WMS.Core.Delivery100ExpressOrders;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Uow;
using System.Linq;
using Ice.Auth.Core;
using Microsoft.Extensions.Logging;

namespace Ice.WMS.BackgroundServices.AmountDeducts;

public class AmountDeductHandle : ITransientDependency
{
    protected IRepository<Delivery100ExpressOrder, Guid> ExpressOrderRepository { get; set; }

    protected IDataFilter DataFilter { get; set; }

    protected IUnitOfWorkManager UnitOfWorkManager { get; set; }

    protected TenantManager TenantManager { get; set; }

    protected ILogger<AmountDeductHandle> Logger { get; set; }

    public AmountDeductHandle(
        IRepository<Delivery100ExpressOrder, Guid> expressOrderRepository,
        IDataFilter dataFilter,
        IUnitOfWorkManager unitOfWorkManager,
        TenantManager tenantManager,
        ILogger<AmountDeductHandle> logger)
    {
        ExpressOrderRepository = expressOrderRepository;
        DataFilter = dataFilter;
        UnitOfWorkManager = unitOfWorkManager;
        TenantManager = tenantManager;
        Logger = logger;
    }

    public async Task Handle()
    {
        // 禁用租户数据过滤
        using (this.DataFilter.Disable<ISoftDelete>())
        using (DataFilter.Disable<IMultiTenant>())
        {
            // 统计昨天的费用
            DateTime now = DateTime.Now.AddDays(-1);
            DateTime startDate = new DateTime(now.Year, now.Month, now.Day);
            DateTime endDate = startDate.AddDays(1);
            var orderQuantitys = (await ExpressOrderRepository.GetQueryableAsync())
            .Where(e => e.CreationTime >= startDate && e.CreationTime < endDate && e.TenantId.HasValue)
            .GroupBy(e => e.TenantId)
            .Select(e => new ExpressOrderLinqResult()
            {
                TenantId = e.Key,
                Quantity = e.Count()
            }).ToList();

            foreach (var orderQuantity in orderQuantitys)
            {
                if (orderQuantity.Quantity == 0)
                {
                    continue;
                }

                using (var uow = UnitOfWorkManager.Begin(requiresNew: true, isTransactional: true))
                {
                    try
                    {
                        await TenantManager.SystemDeduct(orderQuantity.TenantId.Value, orderQuantity.Quantity * WebConfiguration.IceConfig.ExpressOrderFee, $"快递面单扣费");
                        await uow.CompleteAsync();
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError($"租户{orderQuantity.TenantId}扣费失败", ex);
                    }
                }
            }
        }
    }
}

public class ExpressOrderLinqResult
{
    public Guid? TenantId { get; set; }

    public int Quantity { get; set; }
}