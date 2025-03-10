import React, { useEffect } from 'react';
import { Typography, Image } from 'antd';
import { ButtonHelp } from 'ice-layout';
//@ts-ignore
import Img from './SaleReturnOrder.jpg';

export default () => {
    const HelpContent = <div>
        <Typography.Title level={5}>按钮说明</Typography.Title>
        <Typography.Paragraph>1. 结算：将订单标记未"已结算"，方便后期统计</Typography.Paragraph>
        <Typography.Paragraph>2. 订单推送到仓库：如果你开通了仓库服务会出现该按钮，你可以将订单推送到仓库</Typography.Paragraph>
        <Typography.Title level={5}>状态说明</Typography.Title>
        <Typography.Paragraph>1. 待确认：从已签收的销售单上申请退货或直接添加退货单，订单进入待确认状态</Typography.Paragraph>
        <Typography.Paragraph>2. 驳回：管理员审查"待确认"订单，如果订单有问题，可以驳回该订单</Typography.Paragraph>
        <Typography.Paragraph>3. 待处理：管理员审查"待确认"订单，如果订单没有问题，则确认该订单</Typography.Paragraph>
        <Typography.Paragraph>4. 退货中：管理员点击"处理订单"按钮，处理"待处理"的订单，执行处理操作后，订单进入退货中状态</Typography.Paragraph>
        <Typography.Paragraph>5. 已完成：管理员收到货物后，点击完成按钮，订单会变成"已完成"状态</Typography.Paragraph>
        <Image src={Img} />
    </div>

    return <ButtonHelp title='退货单帮助文档' body={HelpContent} />
}