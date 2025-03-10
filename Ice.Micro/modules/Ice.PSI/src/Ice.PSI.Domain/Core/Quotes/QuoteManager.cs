using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.PSI.Core.Quotes
{
    public class QuoteManager : IDomainService
    {
        protected IRepository<Quote, Guid> QuoteRepository { get; }

        public QuoteManager(
            IRepository<Quote, Guid> quoteRepository) 
        {
            QuoteRepository = quoteRepository;
        }

        public async Task CreateAsync(Quote quote) {
            if (await QuoteRepository.AnyAsync(e => e.SupplierId == quote.SupplierId && e.Sku == quote.Sku)) {
                throw new UserFriendlyException(message: "该供应商的报价已存在");
            }

            await QuoteRepository.InsertAsync(quote);
        }

        public async Task DeleteAsync(Guid id) {
            await QuoteRepository.DeleteAsync(id);
        }
    }
}
