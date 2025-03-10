import React, { useEffect } from 'react';
import { Typography, Image } from 'antd';
import { ButtonHelp } from 'ice-layout';
//@ts-ignore
import Img from './WMSInboundOrder.jpg';

export default () => {
    const HelpContent = <div>
        <Typography.Title level={5}>状态说明</Typography.Title>
        <Typography.Paragraph>待收货：货物已进入仓库</Typography.Paragraph>
        <Typography.Paragraph>验货中：仓库管理员点击了"收货"按钮进入"验货中"状态，这时候仓库人员开始验货操作</Typography.Paragraph>
        <Typography.Paragraph>上架中：验货完成后状态自动变更为上架，这时候仓库人员开始货物上架操作</Typography.Paragraph>
        <Typography.Paragraph>已上架：上架完成后状态自动变更为已上架</Typography.Paragraph>
        <Typography.Paragraph>已作废：将入库单作废</Typography.Paragraph>
        <Image style={{width: '100%'}} src={Img} />
    </div>

    return <ButtonHelp title='入库帮助文档' body={HelpContent} />
}