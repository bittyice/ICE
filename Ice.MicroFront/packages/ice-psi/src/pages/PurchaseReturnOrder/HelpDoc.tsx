import React, { useEffect } from 'react';
import { Typography, Image } from 'antd';
import { ButtonHelp } from 'ice-layout';
//@ts-ignore
import Img from './OMSPurchaseReturnOrder.jpg';

export default () => {
    const HelpContent = <div>
        <Typography.Title level={5}>按钮说明</Typography.Title>
        <Typography.Paragraph>1. 结算：将订单标记未"已结算"，方便后期统计</Typography.Paragraph>
        <Typography.Paragraph>2. 订单推送到仓库：如果你开通了仓库服务会出现该按钮，你可以将订单推送到仓库</Typography.Paragraph>
        <Typography.Title level={5}>状态说明</Typography.Title>
        <Typography.Paragraph>1. 待审核：创建采购退货单后进入"待审核"状态</Typography.Paragraph>
        <Typography.Paragraph>2. 退货中：如果确认采购退货单没有问题，点击通过审核按钮，此时采购退货单变成"退货中"状态</Typography.Paragraph>
        <Typography.Paragraph>3. 已完成：完成退货后，点击完成退货按钮，此时采购退货单变成"已完成"状态</Typography.Paragraph>
        <Typography.Paragraph>4. 作废："待审核"状态或者"退货中"状态的订单点击作废按钮，即可作废订单</Typography.Paragraph>
        <Image src={Img} />
    </div>

    return <ButtonHelp title='采购退货单帮助文档' body={HelpContent} />
}