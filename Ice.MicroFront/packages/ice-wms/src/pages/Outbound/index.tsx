import React, { useState, useRef, useEffect } from 'react';
import { Col, Row, Space, Button, Input, Tabs, Table, Tag, Cascader, Divider, Modal, Typography, message, notification, Popover } from 'antd';
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
    SelectFilter
} from 'ice-layout';
import { Edit, Add } from './Edit';
import { InboundOrderApi, inboundOrderSlice, InboundOrderEntity, IceStateType, LabelValues, enums, WarehouseEntity, consts, OutboundOrderApi, ProductInfoHelper, OutboundOrderEntity, ChinaAreaCodeHelper, outboundOrderSlice, Delivery100Api, TenantEntity, addressBookSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';
import Detail from './Detail';
import OutboundPrintModal from './OutboundPrintModal';
import HelpDoc from './HelpDoc';
import PickLocation from './PickLocation';
import LocationInput from '../../components/LocationInput';
import ExpressOrderPrint from './ExpressOrderPrint';
import Kuaidi100Config from '../../components/Kuaidi100Config';
import CancelExpressOrder from './CancelExpressOrder';

export { default as Review } from './Review';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const CreatePickListModel = OpenNewKey((props: {
    open: boolean,
    onCancel: () => void,
    onOk: (pickListNumber: string) => void
}) => {
    const [pickListNumber, setPickListNumber] = useState('');

    const createNumberClick = () => {
        let timestr = Tool.dateFormat(new Date(), 'yyMMddhhmmss')!;
        setPickListNumber(timestr);
    }

    return <Modal
        title='生成拣货单'
        width={300}
        open={props.open}
        maskClosable={false}
        onCancel={props.onCancel}
        onOk={() => {
            if (!pickListNumber) {
                message.error('请输入拣货单');
                return;
            }

            props.onOk(pickListNumber);
        }}
    >
        <LabelEX isMust text={'拣货单号'} style={{ width: '100%', marginTop: 10 }}>
            <Input
                placeholder='拣货单号'
                addonAfter={<Button type='text' size='small' onClick={createNumberClick}>生成</Button>}
                value={pickListNumber}
                maxLength={consts.MinTextLength}
                onChange={(e) => {
                    setPickListNumber(e.currentTarget.value);
                }}
            />
        </LabelEX>
    </Modal>
})

const FastPick = OpenNewKey((props: {
    order: any,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
}) => {
    const [locationCode, setLocationCode] = useState<string>('');

    async function onSubmit() {
        if (!locationCode) {
            message.error('请输入库位');
            return;
        }

        try {
            await OutboundOrderApi.fastPick({
                id: props.order.id,
                locationCode: locationCode
            })
            message.success('已完成拣货');
            props.onOk();
        }
        catch (ex: any) {
            let error = await ProductInfoHelper.translateSku(ex.responseData?.error?.message);
            notification.error({
                message: error
            });
        }
    }

    return <Modal
        title={`快速处理-${props.order.outboundNumber}`}
        open={props.open}
        onCancel={props.onCancel}
        onOk={onSubmit}
        width={350}
    >
        <Typography.Paragraph type='warning'>点击确定后我们会将会扣除该库位的库存，并将订单状态更变为待出库状态</Typography.Paragraph>
        <LabelEX text='下架库位'>
            <LocationInput
                style={{ width: 250 }}
                placeholder='下架库位'
                value={locationCode}
                onChange={(val) => {
                    setLocationCode(val);
                }}
            />
        </LabelEX>
    </Modal>
})

type Props = {
    tenant: TenantEntity,
    warehouseId: string,
    warehouse: WarehouseEntity,
    navigate: (url: any) => void,
};

class Outbound extends React.Component<Props> {
    notificationKey = 'outbound';
    pageRef: CommonPageRefType | null = null;
    printExpressOrderRef: PrintDatas | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<OutboundOrderEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 显示明细
        showDetail: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 生成拣货单号模态
        createPickListShow: false,
        // 默认过滤的值
        defaultFilters: undefined as any,
        // 显示打印出库单
        showOutboundPrint: false,
        // 先生拣货库位
        showPickLocation: false,
        // 显示快速拣货
        showFastPick: false,
    }

    classStatus = [
        { label: '全部', value: '' },
        ...LabelValues.OutboundOrderStatus.map(item => ({
            label: item.label as string,
            value: item.value.toString() as string,
        }))
    ];

    tableName = `W-Outbound-${this.props.warehouseId}`;

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '出库单号',
        key: 'outboundNumber',
        dataIndex: 'outboundNumber',
        sorter: true,
        width: 180,
        render: (val, row) => {
            return <a href="javascript:void(0)" onClick={() => {
                this.setState({ showDetail: true, row: row })
            }}>{val}</a>
        }
    }, {
        title: '类型',
        key: 'orderType',
        dataIndex: 'orderType',
        render: (val, row) => {
            var labelValue = LabelValues.OutboundOrderType.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '联系人',
        key: 'recvContact',
        dataIndex: 'recvContact'
    }, {
        title: '联系电话',
        key: 'recvContactNumber',
        dataIndex: 'recvContactNumber'
    }, {
        title: 'SKU 总数',
        key: 'skuTotalQuantity',
        dataIndex: 'skuTotalQuantity'
    }, {
        title: '出库复核',
        key: 'reviewed',
        dataIndex: 'reviewed',
        render: (val, row) => {
            if (
                row.status != enums.OutboundOrderStatus.TobeOut &&
                row.status != enums.OutboundOrderStatus.Outofstock
            ) {
                return '--';
            }

            return row.reviewed ? <div style={{ color: '#87d068' }}>是</div> : <div>否</div>
        }
    },
    {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: (val, row) => {
            let labelValue = LabelValues.OutboundOrderStatus.find(e => e.value == val);
            return <div style={{ color: labelValue?.color }}>{labelValue?.label}</div>
        }
    }, {
        title: '省/市/区',
        key: 'town',
        dataIndex: 'town',
        width: 200,
        render: (val, row) => {
            return [row.recvProvince, row.recvCity, row.recvTown].filter(e => e).join(' / ');
        }
    }, {
        title: '其他信息',
        key: 'otherInfo',
        dataIndex: 'otherInfo'
    }, {
        title: '快递信息',
        key: 'logisticCode',
        dataIndex: 'logisticCode',
        width: 200,
        render: (val, row) => {
            if (!row.expressNumber) {
                return '--';
            }
            let delivery = Kuaidi100Config.Kuaidi100Required.find(e => e.companyCode == row.shipperCode);
            return `${delivery?.companyName}: ${row.expressNumber || ''}`;
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
        width: 240,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList>
                <Button size='small' type='link' icon={<EditOutlined />}
                    disabled={row.status != enums.OutboundOrderStatus.ToBePicked}
                    onClick={() => {
                        this.setState({
                            showEdit: true,
                            row: row
                        });
                    }}
                >编辑</Button>
                {
                    row.status == enums.OutboundOrderStatus.ToBePicked ?
                        <Popover content='通过勾选订单，然后点击"生成拣货单"来处理订单'>
                            <Button disabled size='small' type='text'>待处理</Button>
                        </Popover>
                        : row.status == enums.OutboundOrderStatus.Picking ?
                            <Button size='small' type='link'
                                onClick={() => {
                                    this.props.navigate(MenuProvider.getUrl(['outinbound', `pick?id=${row.pickListId}`]));
                                }}
                            >去拣货</Button>
                            : row.status === enums.OutboundOrderStatus.TobeOut ?
                                <Button size='small' type='link'
                                    disabled={row.reviewed === true}
                                    onClick={() => {
                                        this.props.navigate(MenuProvider.getUrl(['outinbound', `review?id=${row.id}`]));
                                    }}
                                >去复核</Button>
                                : row.status === enums.OutboundOrderStatus.Outofstock ?
                                    <Button size='small' type='link' disabled>已出库</Button>
                                    : <Button size='small' type='link' disabled>已作废</Button>
                }
                {
                    row.status == enums.OutboundOrderStatus.ToBePicked &&
                    <Button size='small' type='link' ghost
                        onClick={() => {
                            this.setState({
                                showFastPick: true,
                                row: row
                            });
                        }}
                    >快速处理</Button>
                }
                <Button size='small' type='link'
                    onClick={() => {
                        this.setState({ showPickLocation: true, row: row });
                    }}
                >拣货库位</Button>
                {
                    row.status == enums.OutboundOrderStatus.ToBePicked &&
                    row.orderType == enums.OutboundOrderType.Customize &&
                    <Button size='small' danger type='link'
                        onClick={() => {
                            this.invalid(row);
                        }}
                    >作废</Button>
                }
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '出库库单号',
        dataIndex: 'outboundNumber',
        show: true,
        filter: TextFilter
    }, {
        title: '省/市/区',
        dataIndex: 'area',
        show: true,
        filter: (props) => {
            let arr = (props.value || '').split('-').filter((e: string) => e);

            return <Cascader
                bordered={false}
                className='bg-gray-100'
                placeholder='省/市/区'
                allowClear
                changeOnSelect
                style={{ width: '100%', minWidth: 200 }}
                options={ChinaAreaCodeHelper.areas}
                fieldNames={{ label: 'name', value: 'name', children: 'children' }}
                value={arr.filter((e: any) => e)}
                onChange={(arr) => {
                    if (!arr || arr.length == 0) {
                        props.setValue(null);
                    }
                    else {
                        let names = ChinaAreaCodeHelper.getPCAForNames(arr as Array<string>);
                        props.setValue(names.join('-'));
                    }
                }}
            />
        }
    }, {
        title: '联系人',
        dataIndex: 'recvContact',
        filter: TextFilter
    }, {
        title: '联系电话',
        dataIndex: 'recvContactNumber',
        filter: TextFilter
    }, {
        title: '类型',
        dataIndex: 'orderType',
        filter: (props) => <SelectFilter
            {...props}
            filterValues={LabelValues.OutboundOrderType}
        />
    }, {
        title: '复核',
        dataIndex: 'reviewed',
        filter: (props) => <SelectFilter
            {...props}
            filterValues={[{ value: true, label: '是' }, { value: false, label: '否' }]}
        />
    }, {
        title: '创建时间',
        dataIndex: 'creationTime',
        show: true,
        filter: TimeFilter
    }];

    constructor(props: Props) {
        super(props);

        let outboundNumber = Tool.getUrlVariable(window.location.search, 'outboundNumber');
        if (outboundNumber) {
            this.state.defaultFilters = {
                outboundNumber: outboundNumber
            }
        }
    }

    // 作废
    invalid = (row: any) => {
        Modal.confirm({
            title: `作废 - ${row.outboundNumber}`,
            content: '确认作废吗？',
            onOk: () => {
                OutboundOrderApi.invalid(row.id).then(() => {
                    message.success('作废成功');
                    this.pageRef?.refresh();
                });
            }
        });
    }

    // 生成拣货单
    fetchCreatePickList = (number: string) => {
        this.setState({ createPickListShow: false });
        let outboundOrderIds = this.state.selectRows.map((e: any) => e.id);
        OutboundOrderApi.createPickList({
            outboundOrderIds: outboundOrderIds,
            pickListNumber: number
        }).then(() => {
            message.success("成功生成拣货单");
            this.pageRef?.refresh()
        });
    }

    // 出库
    fetchOutofstock = async () => {
        if (this.state.selectRows.length == 0) {
            message.warning("请选择要出库的订单");
            return;
        }

        if (this.state.selectRows.some(e => e.status != enums.OutboundOrderStatus.TobeOut)) {
            message.warning("只能选择待出库的订单");
            return;
        }

        for (let outbound of this.state.selectRows) {
            await OutboundOrderApi.outofstock(outbound.id!).catch((ex) => {
                notification.error({
                    message: `订单 ${outbound.outboundNumber} 出库失败！`,
                    description: ex.responseData?.error?.message,
                    duration: null
                });
            });
        }
        notification.success({
            message: '操作已完成！',
        });
        this.pageRef?.refresh();
    }

    render() {
        return <>
            <CommonPage
                bottomTools={<Space><HelpDoc /></Space>}
                hasExtraInfo
                defaultFilters={this.state.defaultFilters}
                ref={r => this.pageRef = r}
                slice={outboundOrderSlice}
                columns={this.columns}
                filterColumns={this.filterColumn}
                rowSelection={{
                    selectedRowKeys: this.state.selectRows.map(e => e.id),
                    selectedRows: this.state.selectRows,
                    onSelectChange: (selectedRowKeys: Array<any>, selectedRows: Array<any>) => {
                        this.setState({ selectRows: selectedRows });
                    }
                }}
                scroll={{
                    x: 2200
                }}
                classConfig={{
                    classes: this.classStatus,
                    queryName: 'status'
                }}
                tools={<ActionList length={10}>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                    <Button type='link' onClick={() => {
                        if (this.state.selectRows.length == 0) {
                            message.warning("请选择要拣的出库单");
                            return;
                        }

                        for (let outboundOrder of this.state.selectRows as Array<any>) {
                            if (outboundOrder.status != enums.OutboundOrderStatus.ToBePicked) {
                                message.warning(`出库单：${outboundOrder.outboundNumber}不是待拣货状态，只有待拣货的订单才能生成拣货单`);
                                return;
                            }
                        }

                        this.setState({ createPickListShow: true });
                    }}>生成拣货单</Button>
                    <Button type='link'
                        onClick={this.fetchOutofstock}
                    >出库</Button>
                    <ExpressOrderPrint
                        tenant={this.props.tenant}
                        warehouse={this.props.warehouse}
                        selectRows={this.state.selectRows}
                        onOk={() => {
                            this.pageRef?.refresh();
                        }}
                    />
                    <CancelExpressOrder
                        selectRows={this.state.selectRows}
                        onOk={() => {
                            this.pageRef?.refresh();
                        }}
                    />
                    <OutboundPrintModal
                        open={this.state.showOutboundPrint}
                        onCancel={() => {
                            this.setState({ showOutboundPrint: false });
                        }}
                        ids={this.state.selectRows.map(e => e.id)}
                    />
                </ActionList>}
            />
            <Add
                open={this.state.showAdd}
                onCancel={() => {
                    this.setState({
                        showAdd: false
                    });
                }}
                onOk={() => {
                    this.setState({
                        showAdd: false
                    });
                    this.pageRef?.refresh();
                }}
            />
            {
                this.state.row &&
                <Edit
                    entity={this.state.row}
                    open={this.state.showEdit}
                    onCancel={() => {
                        this.setState({
                            showEdit: false
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showEdit: false
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <Detail
                    entity={this.state.row}
                    open={this.state.showDetail}
                    onCancel={() => {
                        this.setState({
                            showDetail: false,
                        });
                    }}
                />
            }
            {
                this.state.row &&
                <FastPick
                    order={this.state.row}
                    open={this.state.showFastPick}
                    onCancel={() => {
                        this.setState({
                            showFastPick: false,
                        });
                    }}
                    onOk={() => {
                        this.setState({
                            showFastPick: false,
                        });
                        this.pageRef?.refresh();
                    }}
                />
            }
            {
                this.state.row &&
                <PickLocation
                    key={`picklocation-${this.state.row.id}`}
                    id={this.state.row.id}
                    open={this.state.showPickLocation}
                    onCancel={() => {
                        this.setState({
                            showPickLocation: false,
                        });
                    }}
                />
            }
            <CreatePickListModel
                open={this.state.createPickListShow}
                onCancel={() => {
                    this.setState({ createPickListShow: false })
                }}
                onOk={this.fetchCreatePickList}
            />
        </>
    }
}

export default () => {
    const dispatch = useDispatch();
    const warehouse = useSelector((state: IceStateType) => state.global.warehouse);
    const tenant = useSelector((state: IceStateType) => state.global.tenant);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(addressBookSlice.asyncActions.fetchAllDatas({}) as any);
    }, []);

    return <Outbound
        navigate={navigate}
        tenant={tenant}
        warehouse={warehouse}
        warehouseId={warehouse.id!}
    />
}
