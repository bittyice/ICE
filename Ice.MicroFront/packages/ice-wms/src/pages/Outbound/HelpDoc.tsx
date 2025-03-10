import React, { useEffect } from 'react';
import { Typography, Image } from 'antd';
import { ButtonHelp } from 'ice-layout';
//@ts-ignore
import Img from './WMSOutboundOrder.jpg';

export default () => {
    const HelpContent = <div>
        <Typography.Paragraph>待拣货：出库单创建完成后的初始状态</Typography.Paragraph>
        <Typography.Paragraph>拣货中：生成"拣货单"后进入该状态，这时候仓库人员根据"拣货单"去拣货</Typography.Paragraph>
        <Typography.Paragraph>待出库："拣货单"完成拣货后进入该状态，这时候仓库人员可以进行"复核"，也可直接"出库"</Typography.Paragraph>
        <Typography.Paragraph>作废：出库单已作废</Typography.Paragraph>
        <Image style={{width: '100%'}} src={Img} />
    </div>

    return <ButtonHelp title='出库帮助文档' body={HelpContent} />
}