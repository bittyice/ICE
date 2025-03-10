import React, { useState, useRef } from 'react';
import { Col, Row, Space, Button, Input, Tabs, Table, Tag, Cascader, Divider, Modal, Typography, message, notification } from 'antd';
import { SyncOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined, PrinterOutlined } from '@ant-design/icons';
import {
    TextFilter,
    TimeFilter,
    ChecksFilter,
    NumFilter,
    CommonPage,
    CommonPageRefType,
    CommonPageProps,
    Barcode,
    PrintDatas,
    MenuProvider,
    OpenNewKey,
    LabelEX,
    ActionList,
    SelectFilter,
    Help
} from 'ice-layout';
import { IceStateType, LabelValues, enums, WarehouseEntity, consts, OutboundOrderApi, ProductInfoHelper, OutboundOrderEntity, ChinaAreaCodeHelper, outboundOrderSlice, PickListEntity, PickListApi, pickListSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';
import HelpDoc from './HelpDoc';

export { default as Sorting } from './Sorting';
export { default as Pick } from './Pick';
export { default as Detail } from './Detail';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const ActionHelp = () => {
    const HelpContent = <div>
        <Typography.Paragraph>
            <Typography.Text type='success'>强制作废：</Typography.Text>
            <Typography.Text>将拣货单作废，拣货单关联的出库单状态将变回"待拣货"状态，使用强制作废功能，已经下架并扣减的库存不会自动恢复回去，你可以使用"无单上架"功能去重新上架产品</Typography.Text>
        </Typography.Paragraph>
    </div>

    return <Help title='操作说明' body={HelpContent} />
}

class PickList extends React.Component<{
    navigate: (url: any) => void
}> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<PickListEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 显示出库单列表
        showOutboundOrder: false,
        // 显示贴单帮助
        showExpressOrderHelp: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 显示快递服务
        showDeliveryService: false,
        // 使用的快递服务
        useDelivery: null
    }

    classStatus = [
        { label: '全部', value: '' },
        ...LabelValues.PickListStatus.map(item => ({
            label: item.label as string,
            value: item.value.toString() as string,
        }))
    ];

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '拣货单号',
        key: 'pickListNumber',
        dataIndex: 'pickListNumber',
        sorter: true,
        render: (val, row) => {
            return <a href="javascript:void(0)" onClick={() => {
                this.props.navigate(MenuProvider.getUrl(['outinbound', `pick-list-detail?id=${row.id}`]));
            }}>{val}</a>
        }
    }, {
        title: '订单总数',
        key: 'orderCount',
        dataIndex: 'orderCount',
    }, {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: (val, row) => {
            let labelValue = LabelValues.PickListStatus.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '创建时间',
        key: 'creationTime',
        dataIndex: 'creationTime',
        sorter: true,
        defaultSortOrder: 'descend',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '操作',
        key: 'action',
        width: 200,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList>
                {
                    row.status == enums.PickListStatus.Picking ?
                        <Button size='small' type='link'
                            onClick={() => {
                                this.props.navigate(MenuProvider.getUrl(['outinbound', `pick?id=${row.id}`]));
                            }}
                        >拣货</Button>
                        : row.status == enums.PickListStatus.Complete ?
                            <Button size='small' type='link' ghost
                                onClick={() => {
                                    this.fetchOutofstock(row);
                                }}
                            >出库</Button>
                            : <Button size='small' type='text' disabled>作废</Button>
                }
                <Button size='small' type='link'
                    disabled={row.status !== enums.PickListStatus.Complete}
                    onClick={() => {
                        this.props.navigate(MenuProvider.getUrl(['outinbound', `sorting?id=${row.id}`]));
                    }}
                >分拣</Button>
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '拣货单号',
        dataIndex: 'pickListNumber',
        show: true,
        filter: TextFilter
    }, {
        title: '创建时间',
        dataIndex: 'creationTime',
        show: true,
        filter: TimeFilter
    }];

    // 出库
    fetchOutofstock = (row: any) => {
        Modal.confirm({
            title: `出库 - ${row.pickListNumber}`,
            content: '确认出库吗？确认后拣货单所关联的出库单将变更为出库状态',
            onOk: () => {
                PickListApi.outofstockOfPickList(row.id).then(() => {
                    message.success('出库成功');
                });
            }
        });
    }

    render() {
        return <CommonPage
            bottomTools={<HelpDoc />}
            ref={r => this.pageRef = r}
            slice={pickListSlice}
            columns={this.columns}
            filterColumns={this.filterColumn}
            rowSelection={{
                selectedRowKeys: this.state.selectRows.map(e => e.id),
                selectedRows: this.state.selectRows,
                onSelectChange: (selectedRowKeys: Array<any>, selectedRows: Array<any>) => {
                    this.setState({ selectRows: selectedRows });
                }
            }}
            classConfig={{
                classes: this.classStatus,
                queryName: 'status'
            }}
            scroll={{
                x: 1200
            }}
        />
    }
}

export default () => {
    const navigate = useNavigate();
    return <PickList
        navigate={navigate}
    />
};
