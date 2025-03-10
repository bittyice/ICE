import React from 'react';
import { Typography, Timeline, Card, Table } from 'antd';
import { ArrowRightOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { iceFetch } from 'ice-common';
import Rate from './Rate';
import BatchSKU from './BatchSKU';
import ExpiredSKU from './ExpiredSKU';

import './index.css'
import { DogEar } from 'ice-layout';
import { IceStateType, areaSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';

type RateType = { value: number, type: string };

class InventoryAnalysis extends React.Component<{
    warehouseId: string,
    areas: Array<any>,
    fetchAreas: () => Promise<any>
}> {
    state = {
        areaRate: [] as RateType[],
        skuQuantityRate: [] as RateType[],
    }

    componentDidMount() {
        this.props.fetchAreas().then(() => {
            this.fetchInventoryAnalysis();
        });
    }

    fetchInventoryAnalysis = () => {
        iceFetch<any>(`/api/wms/inventory-analysis/inventory-analysis?warehouseId=${this.props.warehouseId}`).then(value => {
            let skuQuantityRate: Array<RateType> = [];
            skuQuantityRate.push({
                value: value.skuExpiredQuantity,
                type: '过期数'
            });
            skuQuantityRate.push({
                value: value.skuFreezeQuantity,
                type: '冻结数'
            });
            skuQuantityRate.push({
                value: value.skuTotalQuantity - value.skuExpiredQuantity - value.skuFreezeQuantity,
                type: '其他'
            });

            let areaRate: Array<RateType> = value.areaLocationQuantitys.map((e: any) => ({
                value: e.quantity,
                type: this.props.areas.find(ae => ae.id == e.areaId)?.code || '未知'
            }));

            this.setState({ areaRate, skuQuantityRate });
        });
    }

    render(): React.ReactNode {
        return <div className='wms-ianalysis'>
            <div className='wms-ianalysis-top'>
                <div className='wms-ianalysis-top-item'>
                    <Typography.Title level={5}>库区库位数</Typography.Title>
                    <div style={{ height: 300 }}>
                        <Rate data={this.state.areaRate} />
                    </div>
                    <DogEar text='库位' />
                </div>
                <div className='wms-ianalysis-top-item'>
                    <Typography.Title level={5}>SKU数量占比</Typography.Title>
                    <div style={{ height: 300 }}>
                        <Rate data={this.state.skuQuantityRate} />
                    </div>
                    <DogEar text='SKU' />
                </div>
            </div>
            <div style={{ marginTop: 15 }} className='wms-ianalysis-tables'>
                <div>
                    <BatchSKU />
                </div>
                <div>
                    <ExpiredSKU />
                </div>
            </div>
        </div>
    }
}

export default () => {
    const dispatch = useDispatch();
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];

    const fetchDatas = async () => {
        dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }

    return <InventoryAnalysis
        warehouseId={warehouseId}
        areas={areas}
        fetchAreas={fetchDatas}
    />
}