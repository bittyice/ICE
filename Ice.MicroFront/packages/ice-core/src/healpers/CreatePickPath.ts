import { iceFetch, Tool } from 'ice-common';

export type PickPathItemType = { locationCode: string, sku: string, needPickQuantity: number, orderId: string, orderNumber: string, orderIndex: number };

// 算法类型
export type AlgorithmType = 'Location' | 'Quantity' | 'InboundBatch';

type PickListLocationDetailType = {
    sku: string,
    quantity: number,
    locationCode: string,
    inboundBatch: string,
}

type PickDetailType = { sku: string, needQuantity: number, pickedQuantity: number, orderId: string, orderNumber: string, orderIndex: number }

export default class CreatePickPath {
    // 拣货单
    pickList: any;
    // 要拣货的订单
    outboundOrders!: Array<any>;
    // 要拣货的SKU所在的库位
    pickListLocationDetails!: Array<PickListLocationDetailType>;
    // 要拣的货
    pickDetails!: Array<PickDetailType>;

    init = async (pickListId: string) => {
        this.pickList = await this.fetchPickList(pickListId);
        this.outboundOrders = await this.fetchOutboundOrders(pickListId);
        this.pickListLocationDetails = await this.fetchPickLocation(pickListId, this.pickList.warehouseId);

        // 要拣货的Sku
        this.pickDetails = [];
        for (let outboundOrder of this.outboundOrders) {
            for (let outboundDetail of outboundOrder.outboundDetails) {
                this.pickDetails.push({
                    sku: outboundDetail.sku,
                    needQuantity: outboundDetail.quantity,
                    pickedQuantity: outboundDetail.sortedQuantity,
                    orderId: outboundOrder.id,
                    orderNumber: outboundOrder.outboundNumber,
                    orderIndex: outboundOrder.index,
                });
            }
        }
    }

    // 请求实体
    fetchPickList = (pickListId: string) => {
        return iceFetch(`/api/wms/outbound/pick-list/${pickListId}`);
    }

    fetchPickLocation = (pickListId: string, warehouseId: string) => {
        return iceFetch<any>(`/api/wms/location-detail/pick-list-location-details/${pickListId}`, {
            method: 'GET',
            urlParams: {
                warehouseId: warehouseId
            }
        }).then(data => {
            return data.items;
        });
    }

    fetchOutboundOrders = (pickListId: string) => {
        return iceFetch<any>(`/api/wms/outbound/with-details-for-pick-id/${pickListId}`, {
            method: 'GET',
        }).then((datas) => {
            datas.sort((l: any, r: any) => (l.outboundNumber > r.outboundNumber ? 1 : 0))
            datas.forEach((item: any, i: number) => {
                item.index = i + 1;
            });
            return datas;
        })
    }

    createPickPaths(algorithm: AlgorithmType = 'Location') {
        // 要拣货的产品再库位的分布数量
        let locationSkuQuantityList: Array<PickListLocationDetailType> = Tool.deepCopy(this.pickListLocationDetails);
        // 根据库位编号进行排序
        if (algorithm == 'Location') {
            locationSkuQuantityList.sort((l, r) => l.locationCode >= r.locationCode ? 1 : -1).map(e => ({ ...e }));
        }
        else if (algorithm == 'Quantity') {
            locationSkuQuantityList.sort((l, r) => l.quantity >= r.quantity ? 1 : -1).map(e => ({ ...e }));
        }
        else {
            locationSkuQuantityList.sort((l, r) => l.inboundBatch >= r.inboundBatch ? 1 : -1).map(e => ({ ...e }))
        }

        let pickPaths = [] as Array<PickPathItemType>;
        // 要拣的货物
        let pickDetails: Array<PickDetailType> = Tool.deepCopy(this.pickDetails);
        // 模拟拣货路径进行拣货
        locationSkuQuantityList.forEach(locationSkuQuantity => {
            // locationSkuQuantity 为当前当前货物当前库位的数量
            // 找到要拣的货物
            let curPickDetails = pickDetails.filter(e => e.sku == locationSkuQuantity.sku);
            if (curPickDetails.length == 0) {
                return;
            }

            for (let pickDetail of curPickDetails) {
                // 要拣货的数量
                let pickNum = pickDetail.needQuantity - pickDetail.pickedQuantity;
                // 如果该SKU再这个库位的数量不够了，那就只能拣locationDetail.quantity个了
                if (locationSkuQuantity.quantity < pickNum) {
                    pickNum = locationSkuQuantity.quantity;
                }

                // 如果有货要拣
                if (pickNum > 0) {
                    // 减少库位的货物数量
                    locationSkuQuantity.quantity = locationSkuQuantity.quantity - pickNum;
                    // 我们已经拣了这个货，那我们就增加拣货的数
                    pickDetail.pickedQuantity = pickDetail.pickedQuantity + pickNum;
                    // 记录要拣的货，就当我们拣了这个货
                    pickPaths.push({
                        locationCode: locationSkuQuantity.locationCode,
                        sku: locationSkuQuantity.sku,
                        needPickQuantity: pickNum,
                        orderId: pickDetail.orderId,
                        orderNumber: pickDetail.orderNumber,
                        orderIndex: pickDetail.orderIndex
                    });
                }
            }
        });

        // 重新按照库位进行排序
        pickPaths.sort((l, r) => l.locationCode >= r.locationCode ? 1 : -1);
        return pickPaths;
    }

    pick(orderId: string, sku: string, quantity: number, locationCode: string) {
        // 更新拣货数量
        let pickDetail = this.pickDetails.find(e => e.orderId == orderId && e.sku == sku);
        if (pickDetail) {
            pickDetail.pickedQuantity = pickDetail.pickedQuantity + quantity;
        }

        // 更新库位库存
        let pickListLocationDetail = this.pickListLocationDetails.find(e => e.locationCode == locationCode && e.sku == sku)
        if (pickListLocationDetail) {
            pickListLocationDetail.quantity = pickListLocationDetail.quantity - quantity;
        }

        // 更新订单数量
        let order = this.outboundOrders.find(e => e.id == orderId);
        if (!order) {
            return;
        }
        order.outboundDetails = [...order.outboundDetails];
        let orderDetail = order.outboundDetails.find((e: any) => e.sku == sku);
        if (orderDetail) {
            orderDetail.sortedQuantity = orderDetail.sortedQuantity + quantity;
        }
    }
}