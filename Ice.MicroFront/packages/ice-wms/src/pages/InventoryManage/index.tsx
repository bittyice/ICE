import React, { useState, useRef, useEffect } from 'react';
import { InputNumber, notification, Space, Button, Input, Tabs, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
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
    SelectFilter,
    ImportExcelModal,
    ActionList
} from 'ice-layout';
import { AreaApi, areaSlice, AreaEntity, IceStateType, ProductInfoHelper, LocationApi, WarehouseApi, WarehouseCheckApi, ProductInfoApi, locationDetailSilce } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';
// @ts-ignore
import templeteFile from './templete.xlsx';
import LocationInput from '../../components/LocationInput';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const InboundBatchModal = OpenNewKey((props: {
    title: string,
    open: boolean,
    onCancel: () => void,
    onOk: (inboundBatch: string) => Promise<any>,
}) => {
    const [inboundBatch, setInboundBatch] = useState('');
    const [loading, setLoading] = useState(false);

    return <Modal
        title={props.title}
        width={350}
        confirmLoading={loading}
        open={props.open}
        onCancel={props.onCancel}
        onOk={() => {
            if (!inboundBatch) {
                message.error('请输入入库批次号');
                return;
            }

            setLoading(true);
            props.onOk(inboundBatch).finally(() => {
                setLoading(false);
            });
        }}
    >
        <Input
            placeholder='入库批次号'
            value={inboundBatch}
            onChange={e => {
                setInboundBatch(e.currentTarget.value);
            }}
        />
    </Modal>
})

const UnboxModal = OpenNewKey((props: {
    locationDetail: any,
    open: boolean,
    onCancel: () => void,
    onOk: (unboxQuantity: number, onshlefLocationCode: string) => void,
}) => {
    const [unboxQuantity, setUnboxQuantity] = useState<number | null>(0);
    const [onshlefLocationCode, setOnshlefLocationCode] = useState<string>('');

    return <Modal
        title={`拆箱操作 - ${props.locationDetail.sku}`}
        width={350}
        open={props.open}
        onCancel={props.onCancel}
        onOk={() => {
            if (!unboxQuantity) {
                message.error('请输入拆箱数量');
                return;
            }

            if (!onshlefLocationCode) {
                message.error('请输入你要拆到哪个库位');
                return;
            }

            props.onOk(unboxQuantity, onshlefLocationCode);
        }}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <LabelEX text='拆箱数量' tagStyle={{ width: 100 }}>
                <InputNumber
                    placeholder='拆箱数量'
                    style={{ width: '100%' }}
                    min={0}
                    max={props.locationDetail.quantity}
                    precision={0}
                    value={unboxQuantity}
                    onChange={val => {
                        setUnboxQuantity(val);
                    }}
                />
            </LabelEX>
            <LabelEX text='拆到哪个库位' tagStyle={{ width: 100 }}>
                <LocationInput
                    value={onshlefLocationCode}
                    onChange={val => {
                        setOnshlefLocationCode(val);
                    }}
                />
            </LabelEX>
        </div>
    </Modal>
})

type Props = {
    warehouseId: string,
    navigate: (url: string) => void
}

class InventoryManage extends React.Component<Props> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<any>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤的值
        defaultFilters: undefined as any,
        // 显示批次号输入框
        showBatchFreezeModal: false,
        showBatchUnfreezeModal: false,
        // 显示拆箱模态
        showUnboxModal: false,
        unboxLocationDetail: null as any
    }

    columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: 'Sku',
        key: 'sku',
        dataIndex: 'sku',
        sorter: true,
    }, {
        title: '产品名',
        key: 'name',
        dataIndex: 'name',
        shouldCellUpdate: () => true,
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.name;
        }
    }, {
        title: '入库批次号',
        key: 'inboundBatch',
        dataIndex: 'inboundBatch',
        sorter: true,
        defaultSortOrder: 'descend',
        render: (val) => {
            if (!val) {
                return null;
            }

            return <a href='javascript:void(0)' onClick={() => {
                this.props.navigate(MenuProvider.getUrl(['outinbound', `inbound?inboundBatch=${val}`]));
            }}>{val}</a>
        }
    }, {
        title: '数量',
        key: 'quantity',
        dataIndex: 'quantity',
    }, {
        title: '体积',
        key: 'volume',
        dataIndex: 'volume',
        render: (val, row) => {
            return `${ProductInfoHelper.skuToProducts[row.sku]?.volume || ''}(${ProductInfoHelper.skuToProducts[row.sku]?.volumeUnit || '--'})`;
        }
    }, {
        title: '重量',
        key: 'weight',
        dataIndex: 'weight',
        render: (val, row) => {
            return `${ProductInfoHelper.skuToProducts[row.sku]?.weight || ''}(${ProductInfoHelper.skuToProducts[row.sku]?.weightUnit || '--'})`;
        }
    }, {
        title: '规格',
        key: 'specification',
        dataIndex: 'specification',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.specification;
        }
    }, {
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
        render: (val, row) => {
            return ProductInfoHelper.skuToProducts[row.sku]?.unit;
        }
    }, {
        title: '保质期',
        key: 'shelfLise',
        dataIndex: 'shelfLise',
        sorter: true,
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '是否冻结',
        key: 'isFreeze',
        dataIndex: 'isFreeze',
        render: (val, row) => {
            return !val ? <Tag color="#87d068">未冻结</Tag> : <Tag color="#f50">已冻结</Tag>;
        }
    }, {
        title: '库位编码',
        key: 'locationCode',
        dataIndex: 'locationCode',
        fixed: 'right',
        width: 120
    }, {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        fixed: 'right',
        width: 140,
        render: (val, row) => {
            return <ActionList>
                {
                    row.isFreeze ?
                        <Button size='small' type='link' onClick={() => this.fetchUnfreeze(row)}>解冻</Button> :
                        <Button size='small' type='link' danger onClick={() => this.fetchFreeze(row)}>冻结</Button>
                }
                <Button type='text' size='small' onClick={() => {
                    this.setState({ showUnboxModal: true, unboxLocationDetail: row })
                }}>拆箱</Button>
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: 'SKU',
        dataIndex: 'sku',
        show: true,
        filter: TextFilter
    }, {
        title: '入库批次号',
        dataIndex: 'inboundBatch',
        show: true,
        filter: TextFilter
    }, {
        title: '冻结',
        dataIndex: 'isFreeze',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={[{ label: '已冻结', value: `${true}` }, { label: '未冻结', value: `${false}` }]}
        />
    }, {
        title: '库位编码',
        dataIndex: 'locationCode',
        show: true,
        filter: TextFilter
    }, {
        title: '保质期',
        dataIndex: 'shelfLise',
        filter: TimeFilter
    }];

    constructor(props: Props) {
        super(props);

        let locationCode = Tool.getUrlVariable(window.location.search, 'locationCode');
        if (locationCode) {
            this.state.defaultFilters = {
                locationCode: locationCode
            }
        }
    }

    fetchFreeze = (row: any) => {
        Modal.confirm({
            title: `冻结SKU - ${row.sku}`,
            content: `确定冻结库位${row.locationCode}上的${row.sku}吗？`,
            onOk: () => {
                LocationApi.freeze({
                    "warehouseId": this.props.warehouseId,
                    "locationCode": row.locationCode,
                    "sku": row.sku
                }).then(() => {
                    message.success(`库位${row.locationCode}的${row.sku}已冻结`);
                    this.pageRef?.refresh();
                });
            }
        });
    }

    fetchUnfreeze = (row: any) => {
        LocationApi.unfreeze({
            "warehouseId": this.props.warehouseId,
            "locationCode": row.locationCode,
            "sku": row.sku
        }).then(() => {
            message.success(`库位${row.locationCode}的${row.sku}已解冻`);
            this.pageRef?.refresh();
        });
    }

    fetchFreezeForInboundBatch = (inboundBatch: string) => {
        return LocationApi.freezeForInboundBatch({
            "warehouseId": this.props.warehouseId,
            "inboundBatch": inboundBatch,
        }).then(() => {
            message.success(`冻结成功`);
            this.setState({ showBatchFreezeModal: false });
            this.pageRef?.refresh();
        });
    }

    fetchUnfreezeForInboundBatch = (inboundBatch: string) => {
        return LocationApi.unfreezeForInboundBatch({
            "warehouseId": this.props.warehouseId,
            "inboundBatch": inboundBatch,
        }).then(() => {
            message.success(`解冻成功`);
            this.setState({ showBatchUnfreezeModal: false });
            this.pageRef?.refresh();
        });
    }

    // 导入库存
    fetchImportStock = async (arr: Array<any>) => {
        // 参数检查
        for (let n = 0; n < arr.length; n++) {
            let item = arr[n];
            if (!item.sku) {
                message.error(`第${n + 3}行，请输入SKU`);
                return;
            }

            if (!item.code) {
                message.error(`第${n + 3}行，请输入库位编码`);
                return;
            }

            if (!item.quantity) {
                message.error(`第${n + 3}行，请输入库存数量`);
                return;
            }
        }

        await ProductInfoHelper.fetchProducts(arr.map(e => e.sku));

        // 调用盘点接口更新库存
        for (let n = 0; n < arr.length; n++) {
            let item = arr[n];
            await WarehouseCheckApi.check({
                warehouseId: this.props.warehouseId,
                sku: item.sku,
                quantity: item.quantity,
                locationCode: item.code,
                shelfLise: item.shelfLise,
                inboundBatch: item.inboundBatch,
            }).catch((ex) => {
                notification.error({
                    message: `第${n + 3}行库存更新失败`,
                    description: ex.message,
                    duration: null,
                });
            });
        }
        notification.success({
            message: '成功',
            description: '已成功更新库存',
            duration: null,
        });
        this.pageRef?.refresh();
    }

    // 产品拆箱
    fetchUnboxProduct = async (offLocationCode: string, sku: string, quantity: number, onLocationCode: string) => {
        // 请求产品拆箱信息

        let offProduct = await ProductInfoApi.getWithDetailsForSku(sku);

        if (offProduct.unboxProducts!.length == 0) {
            message.error('该产品不存在拆箱信息，请先完善产品的拆箱信息后再进行拆箱操作');
            return;
        }

        let onshlefItems = offProduct.unboxProducts!.map((unboxProduct: any) => ({
            sku: unboxProduct.sku,
            quantity: unboxProduct.quantity * quantity
        }));



        await LocationApi.unboxing({
            warehouseId: this.props.warehouseId,
            unboxLocationCode: offLocationCode,
            unboxSku: sku,
            unboxQuantity: quantity,
            onshlefLocationCode: onLocationCode,
            onshlefItems: onshlefItems
        });

        message.success('拆箱成功');
        this.pageRef?.refresh();
        this.setState({ showUnboxModal: false });
    }

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={locationDetailSilce}
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
                    x: 1800
                }}
                tools={<ActionList>
                    <Button type='link' danger onClick={() => this.setState({ showBatchFreezeModal: true })}>批次号冻结</Button>
                    <Button type='link' onClick={() => this.setState({ showBatchUnfreezeModal: true })}>批次号解冻</Button>
                    <ImportExcelModal
                        templateUrl={templeteFile}
                        onOk={(datas) => {
                            // 第一行是标题
                            let [title, ...arr] = datas;
                            this.fetchImportStock(arr);
                        }}
                    >
                        <Button type='link'>导入库存</Button>
                    </ImportExcelModal>
                </ActionList>}
            />
            <InboundBatchModal
                title='批次号冻结'
                open={this.state.showBatchFreezeModal}
                onCancel={() => {
                    this.setState({ showBatchFreezeModal: false });
                }}
                onOk={this.fetchFreezeForInboundBatch}
            />
            <InboundBatchModal
                title='批次号解冻'
                open={this.state.showBatchUnfreezeModal}
                onCancel={() => {
                    this.setState({ showBatchUnfreezeModal: false });
                }}
                onOk={this.fetchUnfreezeForInboundBatch}
            />
            {
                this.state.unboxLocationDetail &&
                <UnboxModal
                    locationDetail={this.state.unboxLocationDetail}
                    open={this.state.showUnboxModal}
                    onCancel={() => {
                        this.setState({ showUnboxModal: false });
                    }}
                    onOk={(unboxQuantity: number, onshlefLocationCode: string) => {
                        this.fetchUnboxProduct(
                            this.state.unboxLocationDetail.locationCode,
                            this.state.unboxLocationDetail.sku,
                            unboxQuantity,
                            onshlefLocationCode);
                    }}
                />
            }
        </>
    }
}

export default () => {
    const [refresh, setRefresh] = useState(0);
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const navigate = useNavigate();
    const curPageDatas = useSelector((state: IceStateType) => state.locationDetail.curPageDatas);

    useEffect(() => {
        ProductInfoHelper.fetchProducts(curPageDatas.map(e => e.sku)).then(() => {
            setRefresh(refresh + 1);
        });
    }, [curPageDatas]);

    return <InventoryManage
        warehouseId={warehouseId}
        navigate={navigate}
    />
}
