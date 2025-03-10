import React from 'react';
import { ProductInfoApi } from 'ice-core';
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
            if (!item.sku) {
                message.error(`第${n + 3}行，请输入SKU`);
                return;
            }

            if (!item.name) {
                message.error(`第${n + 3}行，请输入产品名称`);
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
            await ProductInfoApi.create({
                sku: item.sku?.toString(),
                name: item.name?.toString(),
                unit: item.unit?.toString(),
                price: item.price,
                specification: item.specification?.toString()
            }).catch((ex) => {
                notification.error({
                    message: `第${n + 3}行产品创建失败`,
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
            // 第一行是标题
            let [title, ...arr] = datas;
            fetchImportProduct(arr);
        }}
    >
        <Button type='link'>导入产品</Button>
    </ImportExcelModal>
}