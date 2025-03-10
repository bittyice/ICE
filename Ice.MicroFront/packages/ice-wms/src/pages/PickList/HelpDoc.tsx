import React, { useEffect } from 'react';
import { Typography, Image } from 'antd';
import { ButtonHelp } from 'ice-layout';
//@ts-ignore
import Img from './WMSPickList.jpg';

export default () => {
    const HelpContent = <div>
        <Typography.Paragraph>拣货中：拣货单的初始状态，在"出库管理"页面点击生成拣货单即可生成拣货单</Typography.Paragraph>
        <Typography.Paragraph>已完成：完成拣货后进入"已完成"状态</Typography.Paragraph>
        <Image style={{width: '100%'}} src={Img} />
    </div>

    return <ButtonHelp title='拣货帮助文档' body={HelpContent} />
}