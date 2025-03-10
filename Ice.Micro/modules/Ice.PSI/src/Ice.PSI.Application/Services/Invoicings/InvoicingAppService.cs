using Ice.PSI.Core.Invoicings;
using Ice.PSI.Dtos;
using Ice.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace Ice.PSI.Invoicings
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class InvoicingAppService: PSIAppService
    {
        protected IRepository<Invoicing, Guid> InvoicingRepository { get; }

        public InvoicingAppService(
            IRepository<Invoicing, Guid> invoicingRepository) 
        {
            InvoicingRepository = invoicingRepository;
        }

        /// <summary>
        /// 获取某个月的进销存数据
        /// </summary>
        /// <returns></returns>
        public async Task<List<InvoicingDto>> GetMonthInvoicings(GetMonthInvoicingsInput input) 
        {
            var list = await InvoicingRepository.GetListAsync(e => e.Year == input.Year && e.Month == input.Month);
            return ObjectMapper.Map<List<Invoicing>, List<InvoicingDto>>(list);
        }

        /// <summary>
        /// 更新某个月的进销存数据
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task UpdateMonthInvoicings(UpdateMonthInvoicingsInput input) {
            var date = new DateTime(input.Year, input.Month, 1);
            if (date > DateTime.Now || date < new DateTime(2010, 1, 1)) {
                throw new UserFriendlyException("无效的时间段");
            }

            var skus = input.Items.Select(e => e.Sku).ToList();
            // 删除旧数据
            await InvoicingRepository.DeleteAsync(e => e.Year == input.Year && e.Month == input.Month && skus.Contains(e.Sku));

            List<Invoicing> invoicings = new List<Invoicing>();
            foreach (var item in input.Items) {
                invoicings.Add(new Invoicing()
                {
                    Year = input.Year,
                    Month = input.Month,
                    Sku = item.Sku,
                    SaleQuantity = item.SaleQuantity,
                    SaleAmount = item.SaleAmount,
                    InboundQuantity = item.InboundQuantity,
                    InboundAmount = item.InboundAmount,
                    EndStock = item.EndStock,
                    EndAmount = item.EndAmount,
                });
            }

            await InvoicingRepository.InsertManyAsync(invoicings);
        }
    }
}
