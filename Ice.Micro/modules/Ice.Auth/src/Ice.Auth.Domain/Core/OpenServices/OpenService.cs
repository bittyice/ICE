
using System;
using Ice.Auth.Enums;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace Ice.Auth.Core;

// 租户开通的服务
public class OpenService : AggregateRoot<Guid>, IMultiTenant
{
    public string Name { get; protected set; }

    public DateTime ExpireDate { get; protected set; }

    public DateTime OpenDate { get; protected set; }

    public Guid? TenantId { get; protected set; }

    protected OpenService() {}

    public OpenService(Guid id, string name, DateTime expiryDate, Guid tenantId)
    {
        Id = id;
        Name = name;
        ExpireDate = expiryDate;
        OpenDate = DateTime.Now;
        TenantId = tenantId;
    }

    // 延长期限
    public void ExtendDueDate(TimeSpan dueDate)
    {
        if (this.ExpireDate < DateTime.Now)
        {
            this.ExpireDate = DateTime.Now;
        }
        this.ExpireDate = this.ExpireDate.Add(dueDate);
    }

    // 服务是否有效
    public bool IsValid() {
        return this.ExpireDate > DateTime.Now;
    }
}