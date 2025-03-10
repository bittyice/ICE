using AutoMapper;
using Ice.Base.Core.Addresss;
using Ice.Base.Core.Classifys;
using Ice.Base.Core.ProductInfos;
using Ice.Base.Dtos;

namespace Ice.Base;

public class BaseApplicationAutoMapperProfile : Profile
{
    public BaseApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */
        CreateMap<ProductInfo, ProductInfoDto>();
        CreateMap<UnboxProduct, UnboxProductDto>();
        CreateMap<AddressBook, AddressBookDto>();
        CreateMap<Classify, ClassifyDto>();
    }
}
