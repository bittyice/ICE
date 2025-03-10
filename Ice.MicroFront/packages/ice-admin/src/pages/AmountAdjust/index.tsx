import React, { useEffect, useRef, useState } from 'react';
import {
    AmountAdjustEntity,
    AmountAdjustApi,
    amountAdjustSlice
} from 'ice-core';
import { Space, Button, Modal, message, Input, Upload, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, NumberOutlined, WarningOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { CommonPage, TimeFilter, CommonPageProps, CommonPageRefType } from 'ice-layout';
import { IceSliceState, Tool } from 'ice-common';
import type { } from 'ice-common';

type ColumnTypes = CommonPageProps['columns'];
type FilterColumnTypes = CommonPageProps['filterColumns'];

const AmountAdjust = () => {
    const [row, setRow] = useState<AmountAdjustEntity>({} as AmountAdjustEntity);
    const [addKey, setAddKey] = useState(0);
    const [showDetail, setShowDetail] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectRows, setSelectRows] = useState<Array<AmountAdjustEntity>>([]);
    const pageRef = useRef<CommonPageRefType | null>();
    const sliceState: IceSliceState = useSelector((state: any) => state[amountAdjustSlice.name]);
    const dispatch = useDispatch();

    const columns: ColumnTypes = [{
        title: <NumberOutlined />,
        key: 'index',
        fixed: 'left',
        width: 40,
        render: (val, row, index) => {
            return index + 1;
        }
    }, {
        title: '调整前余额',
        dataIndex: 'oldAmount',
        key: 'oldAmount',
        render: (val) => {
            return val;
        }
    }, {
        title: '调整余额',
        dataIndex: 'adjustFee',
        key: 'adjustFee',
        render: (val) => {
            return val;
        }
    }, {
        title: '类型',
        dataIndex: 'type',
        key: 'type'
    },
    {
        title: '外部订单号',
        dataIndex: 'outerNumber',
        key: 'outerNumber'
    }, {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
    }, {
        title: '时间',
        dataIndex: 'creationTime',
        sorter: true,
        defaultSortOrder: 'descend',
        key: 'creationTime',
        render: (val) => {
            return Tool.dateFormat(val);
        }
    }];

    const filterColumns: FilterColumnTypes = [{
        title: '时间',
        dataIndex: 'creationTime',
        filter: TimeFilter
    }];

    useEffect(() => {
    }, []);

    const refreshPage = async () => {
        await pageRef.current?.onChange();
        setSelectRows([]);
    }

    return <CommonPage
        ref={r => pageRef.current = r}
        slice={amountAdjustSlice}
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
}

export default AmountAdjust;
