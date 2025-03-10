using Ice.WMS.Core.Locations;
using Ice.WMS.OnOffShelfs.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;

namespace Ice.WMS.OnOffShelfs
{
    /// <summary>
    /// 无单上下架
    /// </summary>
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.WMSScope)]
    public class OnOffShelfAppService : WMSAppService
    {
        protected LocationManager LocationManager { get; }

        public OnOffShelfAppService(LocationManager locationManager)
        {
            LocationManager = locationManager;
        }

        /// <summary>
        /// 上架
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task OnShelfWithNoOrder([FromBody] OnShelfInput input) {
            await LocationManager.OnShelf(
                input.WarehouseId, 
                input.LocationCode, 
                new OnOffShelfSkuInfo(input.Sku, input.Quantity, input.InboundBatch, input.ShelfLise?.LocalDateTime),
                input.Enforce,
                null);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 下架
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="EntityNotFoundException"></exception>
        [HttpPut]
        public async Task OffShelfWithNoOrder([FromBody] OffShelfInput input) {
            await LocationManager.OffShelf(
                input.WarehouseId, 
                input.LocationCode, 
                input.Sku, 
                input.Quantity,
                null);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
