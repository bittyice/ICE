import React, { useState, useRef, useEffect } from 'react';
import { Col, Row, Space, Button, Input, Tabs, Table, Tag, Pagination, Divider, Modal, Select, message, notification } from 'antd';
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
    SelectFilter,
    ImportExcelModal,
    LabelEX,
    ActionList
} from 'ice-layout';
import { Add } from './Edit';
import { AreaEntity, IceStateType, LocationEntity, LocationApi, locationSlice, areaSlice } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Tool } from 'ice-common';

// @ts-ignore
import templeteFile from './templete.xlsx';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const Print = (props: { selectRows: Array<any> }) => {
    const [printDatasKey, setPrintDatasKey] = useState(0);
    const ref = useRef<PrintDatas>();

    return <>
        <Button icon={<PrinterOutlined />} type='text'
            onClick={() => {
                if (props.selectRows.length == 0) {
                    message.warning('请选择记录');
                    return;
                }

                setPrintDatasKey(printDatasKey + 1);
                setTimeout(() => {
                    ref.current?.print();
                }, 10)
            }}
        >打印库位编码</Button>
        <PrintDatas
            key={printDatasKey}
            ref={r => ref.current = r!}
            printDatas={props.selectRows.map(item => <Barcode code={item.code} />)}
        />
    </>
}

class Location extends React.Component<{
    navigate: (url: string) => void,
    areas: Array<AreaEntity>
}> {
    pageRef: CommonPageRefType | null = null;

    state = {
        // 选择的数据行
        selectRows: [] as Array<LocationEntity>,
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
        // 要导入的库区ID
        areaId: null,
        // 默认过滤的值
        defaultFilters: undefined as any
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
        title: '编码',
        key: 'code',
        dataIndex: 'code',
        sorter: true,
    }, {
        title: '经常使用',
        key: 'often',
        dataIndex: 'often',
        render: (val) => {
            return val ? <div style={{ color: '#87d068' }}>是</div> : <div>否</div>
        }
    }, {
        title: '库区',
        key: 'areaId',
        dataIndex: 'areaId',
        render: (val) => {
            return this.props.areas.find(e => e.id == val)?.code;
        }
    }, {
        title: '操作',
        key: 'action',
        width: 220,
        fixed: 'right',
        render: (val, row) => {
            return <ActionList>
                <Button size='small' type='link'
                    onClick={() => {
                        this.fetchSetOften(row);
                    }}
                >{row.often ? '取消常用' : '设置常用'}</Button>
                <Button size='small' danger type='link' icon={<DeleteOutlined />}
                    onClick={() => {
                        this.fetchDelete(row);
                    }}
                ></Button>
                <Button size='small' type='text' icon={<ArrowRightOutlined />}
                    disabled={row.isDeleted}
                    onClick={() => {
                        this.props.navigate(MenuProvider.getUrl(['warehouseopt', `inventory-manage?locationCode=${row.code}`]))
                    }}
                >库存信息</Button>
            </ActionList>
        }
    }];

    filterColumn: FilterColumnTypes = [{
        title: '编码',
        dataIndex: 'code',
        show: true,
        filter: TextFilter
    }, {
        title: '库区',
        dataIndex: 'areaId',
        show: true,
        filter: (props) => <SelectFilter
            {...props}
            filterValues={this.props.areas.map(item => ({ label: item.code!, value: item.id! }))}
        />
    }];

    constructor(props: any) {
        super(props);

        let areaId = Tool.getUrlVariable(window.location.search, 'areaId');
        if (areaId) {
            this.state.defaultFilters = {
                areaId: areaId
            }
        }
    }

    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除库位 - ${row.code}`,
            content: '确认删除吗？',
            onOk: async () => {
                LocationApi.delete(row.id);
                message.success('删除成功');
                this.pageRef?.refresh();
            }
        });
    }

    async fetchImportLocations(arr: Array<any>) {
        // 检查数据
        for (let n = 0; n < arr.length; n++) {
            if (!arr[n].code) {
                message.error('请输入编码');
                return false;
            }
        }

        let updateNum = 50;
        // 拆分进行上传，不能一次上传太多
        for (let n = 0; n < arr.length; n = n + updateNum) {
            // 当前上传的行
            let uploads = [] as Array<any>;
            for (let m = 0; m < updateNum; m++) {
                let item = arr[n + m];
                if (!item) {
                    break;
                }
                uploads.push({
                    code: item.code,
                    volume: item.volume
                });
            }

            notification.info({
                message: '正在上传...',
                description: `正在上传${n + 1}-${n + uploads.length}行数据，请不要切换或关闭窗口`,
                duration: 25
            });
            await LocationApi.import({
                areaId: this.state.areaId!,
                importLocations: uploads
            }).catch(() => {
                notification.error({
                    message: `${n + 1}-${n + uploads.length}行数据上传失败，请针对这些数据重新上传`,
                    duration: null
                });
            }).finally(() => {
                if (n + uploads.length >= arr.length) {
                    notification.success({
                        message: '上传完成',
                        description: `库位已经上传完成，你现在可以查看库位了`,
                        duration: 25
                    });
                    this.pageRef?.refresh();
                    return;
                }

                return new Promise<void>((resolve) => {
                    // 等待25秒后开始执行下一次导入
                    setTimeout(() => {
                        resolve();
                    }, 25 * 1000);
                });
            });
        }
    }

    fetchSetOften = async (row: any) => {
        await LocationApi.setOften({
            id: row.id,
            often: !row.often
        });
        message.success('设置成功');
        this.pageRef?.refresh();
    }

    render() {
        return <>
            <CommonPage
                ref={r => this.pageRef = r}
                slice={locationSlice}
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
                    x: 1200
                }}
                tools={<ActionList>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => {
                            this.setState({ showAdd: true });
                        }}
                    >添加</Button>
                    <Print selectRows={this.state.selectRows} />
                    <ImportExcelModal
                        templateUrl={templeteFile}
                        otherContent={<LabelEX text={'导入的库区'} style={{ width: '100%', marginTop: 15 }} tagStyle={{ backgroundColor: '#1890ff', color: '#fff', marginRight: 10 }}>
                            <Select
                                placeholder='请选择库区'
                                style={{ width: '100%' }}
                                value={this.state.areaId}
                                onChange={(val) => {
                                    this.state.areaId = val;
                                    this.setState({});
                                }}
                            >
                                {this.props.areas.map(item => (<Select.Option value={item.id}>{item.code}</Select.Option>))}
                            </Select>
                        </LabelEX>}
                        onOk={(datas) => {
                            if (!this.state.areaId) {
                                message.error('请选择导入的库区');
                                return;
                            }

                            // 第一行是标题
                            let [title, ...arr] = datas;
                            this.fetchImportLocations(arr);
                        }}
                    >
                        <Button type='text'>导入库位</Button>
                    </ImportExcelModal>
                </ActionList>}
            ></CommonPage>
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
        </>
    }
}

export default () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];
    const fetchDatas = async () => {
        await dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }

    useEffect(() => {
        fetchDatas();
    }, []);

    return <Location
        navigate={navigate}
        areas={areas}
    />
}