import React, { useEffect, useRef, useState } from 'react';
import {
    TenantEntity,
    TenantOfHostApi,
    enums,
    tenantOfHostSlice
} from 'ice-core';
import { Space, Button, Modal, message, Input, Upload, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, NumberOutlined, WarningOutlined } from '@ant-design/icons';
import { CommonPage, TimeFilter, CommonPageProps, CommonPageRefType, LabelEX } from 'ice-layout';
import { IceSliceState, Tool } from 'ice-common';
import type { } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const Adjust = (props: {
    entity: TenantEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
}) => {
    const [amount, setAmount] = useState<number | null>(props.entity.amount);
    const [remark, setRemark] = useState('');

    const commit = async () => {
        if (amount == null || amount === undefined) {
            message.error('请输入金额');
            return;
        }
        await TenantOfHostApi.adjustAmount({
            amount: amount,
            remark: remark,
            tenantId: props.entity.id!
        })
        message.success('调整成功');
        props.onOk();
    }

    return <Modal
        title={`调整费用 ${(props.entity as any).adminPhone}`}
        open={props.open}
        onCancel={props.onCancel}
        onOk={commit}
    >
        <div className='flex flex-col gap-4'>
            <LabelEX text='费用'>
                <InputNumber
                    placeholder='请输入费用'
                    value={amount}
                    onChange={val => setAmount(val)}
                />
            </LabelEX>
            <LabelEX text='备注'>
                <Input.TextArea
                    placeholder='请输入备注'
                    value={remark}
                    onChange={e => setRemark(e.currentTarget.value)}
                />
            </LabelEX>
        </div>
    </Modal>
}

const SetSaler = (props: {
    entity: TenantEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
}) => {
    const [saler, setSaler] = useState('');

    const commit = async () => {
        if (!saler) {
            message.error('设置销售员');
            return;
        }
        await TenantOfHostApi.setSaler({
            id: props.entity.id!,
            saler: saler,
        })
        message.success('设置成功');
        props.onOk();
    }

    return <Modal
        title={`设置销售员 ${(props.entity as any).adminPhone}`}
        width={300}
        open={props.open}
        onCancel={props.onCancel}
        onOk={commit}
    >
        <div className='flex flex-col gap-4'>
            <LabelEX text='销售员'>
                <Input
                    placeholder='请输入销售员'
                    value={saler}
                    onChange={e => setSaler(e.currentTarget.value)}
                />
            </LabelEX>
        </div>
    </Modal>
}

const ExtendOpenService = (props: {
    entity: TenantEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void,
}) => {
    const [service, setService] = useState<string | null>(null);
    const [daynum, setDaynum] = useState<number | null>(null);

    const commit = async () => {
        if (!service) {
            message.error('请选择服务');
            return;
        }

        if (!daynum) {
            message.error('请输入天数');
            return;
        }

        await TenantOfHostApi.extendOpenServiceDueDate({
            id: props.entity.id!,
            name: service,
            daynum: daynum
        });
        message.success('延长成功');
        props.onOk();
    }

    return <Modal
        title={`延长服务 ${(props.entity as any).adminPhone}`}
        width={300}
        open={props.open}
        onCancel={props.onCancel}
        onOk={commit}
    >
        <div className='flex flex-col gap-4'>
            <LabelEX text='服务'>
                <Select
                    className='w-full'
                    placeholder='服务'
                    value={service}
                    onChange={val => setService(val)}
                >
                    <Select.Option value={enums.IceResourceScopes.AIScope}>{enums.IceResourceScopes.AIScope}</Select.Option>
                    <Select.Option value={enums.IceResourceScopes.PSIScope}>{enums.IceResourceScopes.PSIScope}</Select.Option>
                    <Select.Option value={enums.IceResourceScopes.WMSScope}>{enums.IceResourceScopes.WMSScope}</Select.Option>
                </Select>
            </LabelEX>
            <LabelEX text='天数'>
                <InputNumber
                    className='w-full'
                    placeholder='天数'
                    precision={0}
                    value={daynum}
                    onChange={val => setDaynum(val)}
                />
            </LabelEX>
        </div>
    </Modal>
}

const Tenant = () => {
    const [row, setRow] = useState<TenantEntity>({} as TenantEntity);
    const [addKey, setAddKey] = useState(0);
    const [showDetail, setShowDetail] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showAdjust, setShowAdjust] = useState(false);
    const [showSetSaler, setShowSetSaler] = useState(false);
    const [showExtendOpenService, setShowExtendOpenService] = useState(false);
    const [selectRows, setSelectRows] = useState<Array<TenantEntity>>([]);
    const pageRef = useRef<CommonPageRefType | null>();

    const columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '管理员电话',
        dataIndex: 'adminPhone',
        key: 'adminPhone',
        width: 100,
    }, {
        title: '余额',
        dataIndex: 'amount',
        key: 'amount',
        width: 100,
    }, {
        title: '开通服务',
        dataIndex: 'openServices',
        key: 'openServices',
        render: (val, row) => {
            return <div>
                {
                    row.openServices?.map((e: any) => <div>
                        <span>{e.name}：</span>
                        <span>{Tool.dateFormat(e.expireDate)}</span>
                    </div>)
                }
            </div>
            return row.openServices?.map((e: any) => e.name).join(", ");
        }
    }, {
        title: '销售员',
        dataIndex: 'saler',
        key: 'saler',
        width: 100,
    }, {
        title: '是否激活',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 100,
        render: (val) => {
            return val.toString();
        }
    }, {
        title: '创建时间',
        dataIndex: 'creationTime',
        sorter: true,
        defaultSortOrder: 'descend',
        key: 'creationTime',
        render: (val, row, index) => {
            return Tool.dateFormat(val);
        }
    }, {
        title: '操作',
        key: 'action',
        width: 280,
        render: (val, row, index) => {
            return <Space>
                <Button size='small' onClick={() => {
                    setRow(row);
                    setShowAdjust(true);
                }}>调整费用</Button>
                <Button size='small' onClick={() => {
                    setRow(row);
                    setShowSetSaler(true);
                }}>设置销售员</Button>
                <Button size='small' onClick={() => {
                    setRow(row);
                    setShowExtendOpenService(true);
                }}>延长服务</Button>
            </Space>
        }
    }];

    const filterColumns: FilterColumnTypes = [{
        title: '创建时间',
        dataIndex: 'creationTime',
        filter: TimeFilter
    }];

    return <>
        <CommonPage
            ref={r => pageRef.current = r}
            slice={tenantOfHostSlice}
            columns={columns}
            filterColumns={filterColumns}
            rowSelection={{
                selectedRowKeys: selectRows.map(e => e.id),
                selectedRows: selectRows,
                onSelectChange: (selectedRowKeys: Array<any>, selectedRows: Array<any>) => {
                    setSelectRows(selectedRows);
                }
            }}
        />
        {
            row &&
            <Adjust
                key={row.id}
                entity={row}
                open={showAdjust}
                onCancel={() => setShowAdjust(false)}
                onOk={() => {
                    pageRef.current?.refresh();
                    setShowAdjust(false);
                }}
            />
        }
        {
            row &&
            <SetSaler
                key={row.id}
                entity={row}
                open={showSetSaler}
                onCancel={() => setShowSetSaler(false)}
                onOk={() => {
                    pageRef.current?.refresh();
                    setShowSetSaler(false);
                }}
            />
        }
        {
            row &&
            <ExtendOpenService
                key={row.id}
                entity={row}
                open={showExtendOpenService}
                onCancel={() => setShowExtendOpenService(false)}
                onOk={() => {
                    pageRef.current?.refresh();
                    setShowExtendOpenService(false);
                }}
            />
        }
    </>
}

export default Tenant;
