using Ice.PSI.Core.Quotes;
using Ice.PSI.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Microsoft.AspNetCore.Authorization;
using Ice.Utils;

namespace Ice.PSI.Services.Quotes
{
    [Authorize(Roles = IceRoleTypes.Admin, Policy = IceResourceScopes.PSIScope)]
    public class QuoteAppService : PSIAppService
    {
        protected IRepository<Quote, Guid> QuoteRepository { get; }

        protected QuoteManager QuoteManager { get; }

        public QuoteAppService(
            IRepository<Quote, Guid> quoteRepository,
            QuoteManager quoteManager)
        {
            QuoteRepository = quoteRepository;
            QuoteManager = quoteManager;
        }

        public async Task<PagedResultDto<QuoteDto>> GetListAsync(GetListInput input)
        {
            var sorting = input.Sorting;
            if (
                sorting != nameof(Quote.CreationTime)
                && sorting != nameof(Quote.Sku)
                )
            {
                sorting = nameof(Quote.CreationTime);
            }

            IQueryable<Quote> queryable = await QuoteRepository.GetQueryableAsync();

            if (input.Id != null)
            {
                queryable = queryable.Where(e => e.Id == input.Id);
            }

            if (!string.IsNullOrWhiteSpace(input.Sku))
            {
                queryable = queryable.Where(e => e.Sku == input.Sku);
            }

            if (input.SupplierId != null)
            {
                queryable = queryable.Where(e => e.SupplierId == input.SupplierId);
            }

            if (input.CreationTimeMin != null)
            {
                queryable = queryable.Where(e => e.CreationTime >= input.CreationTimeMin.Value.LocalDateTime);
            }

            if (input.CreationTimeMax != null)
            {
                queryable = queryable.Where(e => e.CreationTime <= input.CreationTimeMax.Value.LocalDateTime);
            }

            long count = queryable.Count();
            List<Quote> list = queryable.IceOrderBy(sorting, input.SortDirection == "descend").Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<QuoteDto>(
                count,
                ObjectMapper.Map<List<Quote>, List<QuoteDto>>(list)
            );
        }

        public async Task<QuoteDto> GetAsync(Guid id)
        {
            var entity = (await QuoteRepository.FindAsync(id));
            if (entity == null)
            {
                throw new EntityNotFoundException();
            }

            return ObjectMapper.Map<Quote, QuoteDto>(entity);
        }

        public async Task CreateAsync(CreateInput input)
        {
            var quote = new Quote(GuidGenerator.Create(), input.Sku, input.SupplierId, CurrentUser.TenantId.Value);
            quote.Price = input.Price;
            quote.Expiration = input.Expiration?.LocalDateTime;
            await QuoteManager.CreateAsync(quote);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, UpdateInput input)
        {
            var quote = (await QuoteRepository.FindAsync(id));
            if (quote == null)
            {
                throw new EntityNotFoundException();
            }

            quote.Price = input.Price;
            quote.Expiration = input.Expiration?.LocalDateTime;

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            await QuoteManager.DeleteAsync(id);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// 获取供应商报价
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<List<GetSupplierQuoteOutputItem>> GetSupplierQuoteAsync(GetSupplierQuoteInput input) {
            if (input.Skus.Count == 0) {
                return new List<GetSupplierQuoteOutputItem>();
            }

            var now = DateTime.Now;
            var items = (await QuoteRepository.GetQueryableAsync()).Where(e => e.SupplierId == input.SupplierId && input.Skus.Contains(e.Sku) && (!e.Expiration.HasValue || e.Expiration > now))
                .Select(e => new GetSupplierQuoteOutputItem()
                {
                    Price = e.Price,
                    Sku = e.Sku
                }).ToList();

            return items;
        }

        [HttpPost]
        public async Task Import(ImportInput input) {
            if (input.Items.Count > 100) {
                throw new UserFriendlyException("一次最大只能导入100条数据");
            }

            IQueryable<Quote> queryable = await QuoteRepository.GetQueryableAsync();
            var inputSkus = input.Items.Select(e => e.Sku.Trim()).ToList();
            List<Quote> existQuotes = queryable.Where(e => e.SupplierId == input.SupplierId && inputSkus.Contains(e.Sku)).ToList();

            List<Quote> insertQuotes = new List<Quote>();
            input.Items.ForEach(item =>
            {
                var existQuote = existQuotes.FirstOrDefault(e => e.Sku == item.Sku);
                if (existQuote != null)
                {
                    existQuote.Price = item.Price;
                    existQuote.Expiration = item.Expiration?.LocalDateTime;
                    return;
                }
                var newQuote = new Quote(GuidGenerator.Create(), item.Sku, input.SupplierId, CurrentTenant.Id.Value);
                newQuote.Price = item.Price;
                newQuote.Expiration = item.Expiration?.LocalDateTime;
                insertQuotes.Add(newQuote);
            });

            await QuoteRepository.InsertManyAsync(insertQuotes);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
