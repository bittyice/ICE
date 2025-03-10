import React from 'react';
import { warehouseSlice, store, globalSlice, WarehouseEntity, IceStateType } from 'ice-core';
import { Storage } from 'ice-common';
import { Select, message, Popover, Button, Dropdown, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { SwapOutlined, DownOutlined, EllipsisOutlined, OrderedListOutlined } from '@ant-design/icons';
import { token, createClearReduxDatasAction } from 'ice-common';

const storageKey = '_curwarehouse_';

export const InitFunc = async () => {
    await store.dispatch(warehouseSlice.asyncActions.fetchAllDatas({}));
    var warehouses = store.getState().warehouse.allDatas as Array<WarehouseEntity>;
    if (!warehouses || warehouses.length == 0) {
        throw new Error('没有可操作的仓库，请建立仓库后再进入仓库管理系统');
    }

    return Storage.getItem(storageKey).then(warehouseId => {
        let first = warehouses[0];

        if (!warehouseId) {
            store.dispatch(globalSlice.actions.setWarehouse({ warehouse: first }));
            Storage.setItem(storageKey, first.id!);
            return;
        }

        var warehouse = warehouses.find(e => e.id == warehouseId);
        if (!warehouse) {
            store.dispatch(globalSlice.actions.setWarehouse({ warehouse: first }));
            Storage.setItem(storageKey, first.id!);
            return;
        }

        store.dispatch(globalSlice.actions.setWarehouse({ warehouse: warehouse }));
    });
}

class WarehouseSelect extends React.Component<{
    warehouse: WarehouseEntity,
    setWarehouse: (warehouse: WarehouseEntity) => void,
    warehouses: Array<WarehouseEntity>,
}> {
    onWarehouseChange = (warehouseId: string) => {
        var warehouse = this.props.warehouses.find(e => e.id == warehouseId);
        if (!warehouse) {
            message.error('仓库切换失败，未找到仓库信息');
            return;
        }
        this.props.setWarehouse(warehouse);
        message.info(`已切换至仓库-${warehouse.name}`);
        Storage.setItem(storageKey, warehouseId);
        store.dispatch(createClearReduxDatasAction());
        store.dispatch(globalSlice.actions.refreshLayout());
    }

    render(): React.ReactNode {
        const items = this.props.warehouses.map(item => ({
            key: item.id!,
            label: item.name,
            onClick: () => this.onWarehouseChange(item.id!)
        }))
        return <div>
            <Dropdown menu={{ items }}>
                <Button size='small' type='primary'>
                    <Space>
                        <span>{this.props.warehouse?.name}</span>
                        <OrderedListOutlined />
                    </Space>
                </Button>
            </Dropdown>
            {/* <Dropdown.Button className='rounded-full' size='small' type='primary' menu={{ items }}>
                {this.props.warehouse?.name}
            </Dropdown.Button> */}
        </div>
    }
}

export default () => {
    const warehouses = useSelector((state: IceStateType) => state.warehouse.allDatas) || [];
    const warehouse = useSelector((state: IceStateType) => state.global.warehouse)!;
    const dispatch = useDispatch();

    return <WarehouseSelect
        warehouse={warehouse}
        warehouses={warehouses}
        setWarehouse={(warehouse) => {
            dispatch(globalSlice.actions.setWarehouse({ warehouse: warehouse }));
        }}
    />
};