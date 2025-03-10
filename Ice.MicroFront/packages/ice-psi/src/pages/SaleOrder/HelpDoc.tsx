import React, { useEffect } from 'react';
import { Typography, Image } from 'antd';
import { ButtonHelp } from 'ice-layout';
//@ts-ignore
import Img from './SaleOrder.jpg';

export default () => {
    const HelpContent = <div>
        <Typography.Title level={5}>按钮说明</Typography.Title>
        <Typography.Paragraph>1. 结算：将订单标记未"已结算"，方便后期统计</Typography.Paragraph>
        <Typography.Paragraph>2. 订单推送到仓库：如果你开通了仓库服务会出现该按钮，你可以将订单推送到仓库</Typography.Paragraph>
        <Typography.Title level={5}>状态说明</Typography.Title>
        <Typography.Paragraph>1. 待确认：创建销售单后进入"待确认"状态</Typography.Paragraph>
        <Typography.Paragraph>2. 驳回：管理员审查"待确认"订单，如果订单有问题，可以驳回该订单</Typography.Paragraph>
        <Typography.Paragraph>3. 待处理：管理员审查"待确认"订单，如果订单没有问题，则可以确认该订单</Typography.Paragraph>
        <Typography.Paragraph>4. 处理中：确认订单后，管理员点击"处理订单"按钮，此时订单状态变成"处理中"</Typography.Paragraph>
        <Typography.Paragraph>5. 签收：如果客户签收了，则点击签收完成收货</Typography.Paragraph>
        <Image src={Img} />
    </div>

    return <ButtonHelp title='销售订单帮助文档' body={HelpContent} />
}