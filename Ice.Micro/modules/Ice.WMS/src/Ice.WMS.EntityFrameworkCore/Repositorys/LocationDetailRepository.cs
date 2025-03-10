using Ice.WMS.Core.Locations;
using Ice.WMS.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace Ice.WMS.Repositorys
{
    public class LocationDetailRepository : EfCoreRepository<WMSDbContext, LocationDetail, Guid>, ILocationDetailRepository
    {
        public LocationDetailRepository(IDbContextProvider<WMSDbContext> dbContextProvider) : base(dbContextProvider)
        {
        }

        public async Task SetIsFreezeForInboundBatch(Guid tenantId, Guid warehouseId, string inboundBatch, bool isFreeze)
        {
            var dbContext = await GetDbContextAsync();
            await dbContext.Database.ExecuteSqlRawAsync(
$@"UPDATE WMSLocationDetail ld join WMSLocation l on ld.LocationId= l.id 
SET ld.IsFreeze = {isFreeze}
WHERE ld.InboundBatch = '{inboundBatch}' and l.WarehouseId = '{warehouseId}' and ld.TenantId = '{tenantId}'
"
            );
        }
    }
}
