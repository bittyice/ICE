using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using System.Linq;
using Volo.Abp;
using Ice.WMS.Core.Areas;

namespace Ice.WMS.Core.Warehouses
{
    public class WarehouseManager : DomainService
    {
        protected IRepository<Warehouse, Guid> WarehouseRepository { get; }

        protected IRepository<Area, Guid> AreaRepository { get; }

        public WarehouseManager(
            IRepository<Warehouse, Guid> warehouseRepository,
            IRepository<Area, Guid> areaRepository) {
            WarehouseRepository = warehouseRepository;
            AreaRepository = areaRepository;
        }

        public async Task Create(Warehouse warehouse) {
            if (await WarehouseRepository.AnyAsync(e => e.Code == warehouse.Code)) {
                throw new UserFriendlyException(message: "仓库编码已存在");
            }

            await WarehouseRepository.InsertAsync(warehouse);
            // 生成一个库区
            await AreaRepository.InsertAsync(new Area(GuidGenerator.Create(), "A", warehouse.Id, warehouse.TenantId.Value) { 
                IsActive = true,
            });
        }

        public async Task DeleteAsync(Guid id) {
            if (await AreaRepository.AnyAsync(e => e.WarehouseId == id)) {
                throw new UserFriendlyException(message: "请进入仓库清空库区后再进行删除操作");
            }

            await WarehouseRepository.DeleteAsync(id);
        }
    }
}
