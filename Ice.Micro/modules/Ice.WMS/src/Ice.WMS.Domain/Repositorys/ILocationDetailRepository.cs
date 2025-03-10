using Ice.WMS.Core.Locations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace Ice.WMS.Repositorys
{
    public interface ILocationDetailRepository : IRepository<LocationDetail, Guid>
    {
        public Task SetIsFreezeForInboundBatch(Guid tenantId, Guid warehouseId, string inboundBatch, bool isFreeze);
    }
}
