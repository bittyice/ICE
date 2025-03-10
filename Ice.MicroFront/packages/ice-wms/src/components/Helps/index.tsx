import React, { useEffect } from 'react';
import { Typography, Image, Divider, Row, Col, Select, Checkbox, Tag, Table, Button, Space, Input, InputNumber, Modal, message, } from 'antd';
import { LabelEX, CardEX, Help } from 'ice-layout';

let { Title } = Typography;

export const OnShelfHelp = () => {
    const HelpContent = <div>
        <Typography.Paragraph>1. 输入SKU，上架数量，上架库位（按回车光标会自动跳转）</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>2. 点击"上架"按钮进行上架（也可以在"上架库位"输入框按回车进行上架）</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>3. 当所有明细的上架数量大于实际数量，会提示是否完成上架，点击确认可完成上架，完成上架后订单状态变成"已完成"</Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: 10 }}>4. 点击"强制完成上架"可强制完成上架，完成上架后订单状态变成"已完成"</Typography.Paragraph>
    </div>

    return <Help title='上架操作说明' body={HelpContent} />
}

export const EnforceOnShelfHelp = () => {
    const HelpContent = <div>
        <Typography.Title level={5}>当前上架所遇到的问题</Typography.Title>
        <Typography.Paragraph style={{ marginTop: 10 }}>
            <Typography.Text>具有相同SKU但其他信息不同的产品</Typography.Text>
            <Typography.Text type='warning'>（如入库批次号等不同）</Typography.Text>
            <Typography.Text>，他们不能存放在同一库位，因为它会使系统变得混乱（如一个库位有2个不同批次号的SKU，当你进行出库时系统无法判断你出的是哪个批次号的SKU）</Typography.Text>
        </Typography.Paragraph>
        <Typography.Title style={{ marginTop: 10 }} level={5}>强制上架的作用</Typography.Title>
        <Typography.Paragraph style={{ marginTop: 10 }}>
            <Typography.Text>勾选了"强制上架"后，系统将忽略这些不同的信息进行上架（即忽略新上架的SKU的信息，如新上架的SKU的批次号为002，已存在的SKU批次号为001，那么新上架的SKU的批次号将会被修改为001）</Typography.Text>
        </Typography.Paragraph>
    </div>

    return <Help title='强制上架说明' body={HelpContent} />
}

export const InboundBatchHelp = () => {
    const HelpContent = <div>
        <Typography.Title level={5}>入库批次号有什么用？</Typography.Title>
        <Typography.Text>入库批次号用于货物的先进先出，先进入仓库的批次号较小，在出库时会优先对这些货物出库</Typography.Text>
        <Typography.Title level={5}>在哪里开启入库批次号？</Typography.Title>
        <Typography.Text>入库批次号默认为开启状态，管理员可以启用或禁用入库批次号，登录管理端 - 进入仓库选项 - 编辑仓库</Typography.Text>
        <Typography.Paragraph style={{marginTop: 10}} type='warning'>入库批次号为系统自动生成，请不要试图去更改入库批次号，这样会影响系统的出库排序</Typography.Paragraph>
        <Typography.Paragraph style={{marginTop: 10}} type='danger'>开启入库批次号后，不同批次的货物将不能放在同一个库位中</Typography.Paragraph>
    </div>

    return <Help title='入库批次号说明' body={HelpContent} />
}

export const AlertQuantityHelp = () => {
    const HelpContent = <div>
        <Typography.Paragraph>在仓库的库存少于该数量时，将会每天向仓库发送预警消息</Typography.Paragraph>
        <Typography.Paragraph>想要停止消息，可以禁用预警或者新建包含预警SKU的入库单</Typography.Paragraph>
    </div>

    return <Help title='库存预警数量说明' body={HelpContent} />
}