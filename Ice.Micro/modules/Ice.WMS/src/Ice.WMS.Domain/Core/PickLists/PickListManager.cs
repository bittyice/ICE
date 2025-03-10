using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace Ice.WMS.Core.PickLists
{
    public class PickListManager : IDomainService
    {
        protected IRepository<PickList> PickListRepository { get; }

        public PickListManager(
            IRepository<PickList> pickListRepository) { 
            PickListRepository = pickListRepository;
        }

        public async Task CreateAsync(PickList outboundOrder)
        {
            if (await PickListRepository.AnyAsync(e => e.PickListNumber == outboundOrder.PickListNumber))
            {
                throw new UserFriendlyException(message: "拣货单号已存在", WMSErrorCodes.PickListNumberRepeat);
            }

            await PickListRepository.InsertAsync(outboundOrder);
        }
    }
}
