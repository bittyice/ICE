import React from 'react';
import { Button, notification, Space, Select, Input, InputNumber, Table, Tag, Pagination, Divider, Modal, TreeSelect, message, Checkbox, Popover } from 'antd';
import { SyncOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
    HighLevelSearch,
    FilterColumnType,
    TextFilter,
    TimeFilter,
    ChecksFilter,
    RadioFilter,
    NumFilter,
    CommonPage,
    CommonColumnType,
    LabelEX,
    SelectFilter,
    CommonPageClassType,
    ExtraInfoShow,
    Help,
} from 'ice-web-layout';
import { withRouter, RouteComponentProps } from 'ice-router-dom';
import { enums, ErrorCodes, Fetch } from 'ice-core';


// 全局保存，否则切换页面再切回来数据不见了
var skuStocks = {} as any;

const Shops = [
    { label: '全部', value: '' },
    { label: '拼多多', value: 'PDD' },
    { label: '得物', value: 'DW' },
    { label: '抖音', value: 'DY' }
]

type Props = {
} & RouteComponentProps;

class StockSync extends React.Component<Props> {
    notificationKey = 'StockSync';
    pageRef!: CommonPageClassType;

    state = {
        // 选择的数据行
        selectRows: [],
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 默认过滤的值
        defaultFilters: undefined as any,
    }

    tableName = 'W-StockSync';

    columns: Array<CommonColumnType> = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: 'SKU',
        key: 'sku',
        dataIndex: 'sku',
        sorter: true,
        defaultSortOrder: 'descend',
        width: 150,
    }, {
        title: '产品名',
        key: 'name',
        dataIndex: 'name',
        sorter: true,
    }, {
        title: '计量单位',
        key: 'unit',
        dataIndex: 'unit',
    }, {
        title: '当前库存数',
        key: 'currentStock',
        dataIndex: 'currentStock',
        render: (val, row) => {
            return skuStocks[row.sku] || 0;
        }
    }];

    filterColumn: Array<FilterColumnType> = [{
        title: 'SKU',
        dataIndex: 'sku',
        show: true,
        filter: TextFilter
    }];

    constructor(props: Props) {
        super(props);
    }

    fetchSkuStocks = (skus: Array<string>) => {
        return Fetch.fetch({
            url: '/api/wms/location-detail/stock-inquire-for-skus',
            method: 'GET',
            urlParams: {
                skus: skus.map((e: any) => e.sku)
            }
        }).then(datas => {
            skuStocks = {} as any;
            datas.forEach((data: any) => {
                skuStocks[data.sku] = data.quantity;
            })
        });
    }

    fetchSyncPdd = async () => {
        if (this.state.selectRows.length == 0) {
            message.warning('请选择要同步的产品');
            return;
        }

        if (this.state.selectRows.some((e: any) => !e.pdd)) {
            message.warning('产品未关联到拼多多，无法进行同步');
            return;
        }

        notification.info({
            key: this.notificationKey,
            message: '正在同步库存...',
            description: '正在同步库存，请不要关闭或切换当前页面',
            duration: null
        });

        for (let product of this.state.selectRows as Array<any>) {
            let stock = skuStocks[product.sku] || 0;
            await Fetch.fetch({
                url: '/api/tp/pdd/stock',
                method: 'PUT',
                body: {
                    "goodsOuterId": product.pdd.goodsId,
                    "skuOuterId": product.pdd.skuId,
                    "quantity": stock
                }
            }).catch(ex => {
                // 未授权，跳转授权
                if (ex?.response?.error?.code == ErrorCodes.PDDUnauthorized) {
                    message.error('拼多多授权失败，请异步至店铺授权完成授权');
                    return;
                }

                notification.error({
                    message: `同步 ${product.sku} 库存失败`,
                    description: ex.message,
                    duration: null
                });
            });
        }

        notification.destroy(this.notificationKey);
        notification.success({
            message: '库存同步完成',
            description: '库存同步完成，你现在可以切换至其他页面进行操作了',
            duration: null
        });
    }

    render() {
        return <CommonPage
            storageName='W-StockSync'
            hasExtraInfo
            onRef={r => this.pageRef = r}
            onfetchDatasBackcall={this.fetchSkuStocks}
            url={`/api/base/product-info`}
            tableName={this.tableName}
            classConfig={{
                queryName: 'platform',
                classes: Shops
            }}
            columns={this.columns}
            filterColumn={this.filterColumn}
            defaultFilters={this.state.defaultFilters}
            onSelectChange={(selectedRowKeys: Array<any>, selectedRows: Array<any>) => {
                this.setState({ selectRows: selectedRows });
            }}
            scroll={{
                x: 1200
            }}
            tools={<Space>
                <Button type='primary' ghost onClick={this.fetchSyncPdd}>同步至拼多多</Button>
                <Button type='primary' ghost onClick={() => {
                    message.warning("暂不支持改操作");
                }}>同步至得物</Button>
                <Button type='primary' ghost onClick={() => {
                    message.warning("暂不支持改操作");
                }}>同步至抖音</Button>
            </Space>}
        >
        </CommonPage>
    }
}

export default withRouter(StockSync);