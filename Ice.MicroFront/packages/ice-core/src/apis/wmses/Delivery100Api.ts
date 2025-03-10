import { iceFetch } from 'ice-common';
import Api from '../Api';
import { Delivery100Entity, Delivery100ExpressOrderEntity } from '../Types';
import ProductInfoHelper from '../../healpers/ProductInfoHelper';

class ApiEx {
    async getAllConfigs() {
        return await iceFetch<Array<Delivery100Entity>>(`/api/wms/delivery100/configs`);
    }

    async updateConfig(params: Delivery100Entity) {
        return await iceFetch(`/api/wms/delivery100/config/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params)
        });
    }

    async createConfig(params: Delivery100Entity) {
        return await iceFetch(`/api/wms/delivery100/config`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async setActive(params: {
        id: string,
        isActive: boolean
    }) {
        return await iceFetch(`/api/wms/delivery100/set-active-config/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                isActive: params.isActive
            })
        })
    }

    async setDefault(id: string) {
        return await iceFetch(`/api/wms/delivery100/set-default-config/${id}`, {
            method: 'PUT'
        });
    }

    async getExpressOrder(outboundOrder: any, warehouse: any, delivery: any) {
        let details = outboundOrder.outboundDetails || [];
        await ProductInfoHelper.fetchProducts(details.map((e: any) => e.sku));
        let cargos: Array<string> = [];
        details.forEach((detail: any) => {
            let productName = ProductInfoHelper.skuToProducts[detail.sku]?.name || '';
            cargos.push(`${productName}*${detail.sortedQuantity}`)
        });
        // 获取电子面单
        let expressOrder = await iceFetch<Delivery100ExpressOrderEntity>('/api/wms/delivery100/label-order', {
            method: 'POST',
            body: JSON.stringify({
                deliveryId: delivery.id,
                orderNumber: outboundOrder.outboundNumber,
                payType: delivery.payType,
                expType: delivery.expType,
                cargo: cargos.join(', '),
                sender: {
                    name: warehouse.principal,
                    mobile: warehouse.contactNumber,
                    address: [warehouse.province, warehouse.city, warehouse.town, warehouse.addressDetail].filter(e => e).join('')
                },
                receiver: {
                    name: outboundOrder.recvContact,
                    mobile: outboundOrder.recvContactNumber,
                    address: [outboundOrder.recvProvince, outboundOrder.recvCity, outboundOrder.recvTown, outboundOrder.recvAddressDetail].filter(e => e).join('')
                },
            })
        });

        return expressOrder;
    }

    async cancelExpressOrder(outboundOrder: any) {
        return await iceFetch('/api/wms/delivery100/label-cancel', {
            method: 'POST',
            body: JSON.stringify({
                orderNumber: outboundOrder.outboundNumber
            })
        });
    }
}

export default new ApiEx();