using Ice.WMS.Core.Locations;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.WMS.Core.Areas
{
    public class AreaManager : IDomainService
    {
        protected IRepository<Area, Guid> AreaRepository { get; }

        protected IRepository<Location, Guid> LocationRepository { get; }

        public AreaManager(IRepository<Area, Guid> areaRepository,
            IRepository<Location, Guid> locationRepository)
        {
            AreaRepository = areaRepository;
            LocationRepository = locationRepository;
        }

        public async Task Create(Area area)
        {
            if (await AreaRepository.AnyAsync(e => e.WarehouseId == area.WarehouseId && e.Code == area.Code))
            {
                throw new UserFriendlyException(message: "库区编码已存在");
            }

            await AreaRepository.InsertAsync(area);
        }

        public async Task Delete(Guid id) {
            if (await LocationRepository.AnyAsync(e => e.AreaId == id)) {
                throw new UserFriendlyException(message: "无法删除库区，请先清空库区下的库位");
            }
            await AreaRepository.DeleteAsync(id);
        }
    }
}
