import React from 'react';
import { AddressBookApi } from 'ice-core';
import { message, notification, Button } from 'antd';
import { ImportExcelModal } from 'ice-layout';
// @ts-ignore
import templeteFile from './templete.xlsx';

export default (props: {
    onOk: () => void,
}) => {
    const fetchImportProduct = async (arr: Array<any>) => {
        // 参数检查
        for (let n = 0; n < arr.length; n++) {
            let item = arr[n];
            if (!item.name) {
                message.error(`第${n + 3}行，请输入地址名称`);
                return;
            }
        }

        notification.warning({
            message: '正在导入！',
            description: '正在导入数据，请不要关闭当前窗口',
            duration: null,
        });
        // 调用创建接口创建产品
        for (let n = 0; n < arr.length; n++) {
            let item = arr[n];
            await AddressBookApi.create({
                name: item.name?.toString() || '--',
                contact: item.contact?.toString() || '--',
                contactNumber: item.contactNumber?.toString() || '--',
                addressDetail: item.addressDetail?.toString() || '--',
                postcode: item.postcode?.toString(),
                province: item.province?.trim(),
                city: item.city?.trim(),
                town: item.town?.trim(),
            }).catch((ex) => {
                notification.error({
                    message: `第${n + 3}行地址创建失败`,
                    description: ex.message,
                    duration: null,
                });
            });
        }
        notification.success({
            message: '成功',
            description: '已成功导入',
            duration: null,
        });
        props.onOk();
    }

    return <ImportExcelModal
        templateUrl={templeteFile}
        onOk={(datas) => {
            debugger
            // 第一行是标题
            let [title, ...arr] = datas;
            fetchImportProduct(arr);
        }}
    >
        <Button type='link'>导入地址</Button>
    </ImportExcelModal>
}