using AutoMapper;
using Ice.PSI.Core.Contracts;
using Ice.PSI.Core.PurchaseOrders;
using Ice.PSI.Core.Quotes;
using Ice.PSI.Core.SaleOrders;
using Ice.PSI.Core.PurchaseReturnOrders;
using Ice.PSI.Core.SaleReturnOrders;
using Ice.PSI.Core.Suppliers;
using Ice.PSI.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ice.PSI.Core.Invoicings;
using Ice.PSI.Core.ProductStocks;
using Ice.PSI.Core.PaymentMethods;

namespace Ice.PSI;

public class PSIApplicationAutoMapperProfile : Profile
{
    public PSIApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */

        CreateMap<PurchaseOrder, PurchaseOrderDto>();
        CreateMap<PurchaseDetail, PurchaseDetailDto>();
        CreateMap<PurchaseReturnOrder, PurchaseReturnOrderDto>();
        CreateMap<PurchaseReturnDetail, PurchaseReturnDetailDto>();
        CreateMap<Quote, QuoteDto>();
        CreateMap<Supplier, SupplierDto>();

        CreateMap<Contract, ContractDto>();

        CreateMap<SaleOrder, SaleOrderDto>();
        CreateMap<RecvInfo, RecvInfoDto>();
        CreateMap<SaleDetail, SaleDetailDto>();
        CreateMap<SaleReturnOrder, SaleReturnOrderDto>();
        CreateMap<SaleReturnDetail, SaleReturnDetailDto>();
        CreateMap<Invoicing, InvoicingDto>();
        CreateMap<ProductStock, ProductStockDto>();
        CreateMap<PaymentMethod, PaymentMethodDto>();
    }
}
