import React from 'react';
import { DatePicker, Card, Divider, Row, Col, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, IceStateType, SupplierApi, SupplierEntity } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';

type Props = {
    entity?: SupplierEntity,
    open: boolean,
    onCancel: () => void,
};

class Page extends React.Component<Props> {
    state = {
        loading: false,
        entity: {} as SupplierEntity,
    }

    componentDidMount() {
        this.fetchEntity();
    }

    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return SupplierApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    render() {
        return <Modal
            title={`详情 - ${this.props.entity?.code}`}
            open={this.props.open}
            maskClosable={false}
            width={400}
            onCancel={this.props.onCancel}
            footer={null}
        >
            <div>
                <CardEX title='基本信息' bodyStyle={{ justifyContent: 'flex-start' }}>
                    <LabelEX isMust text={'编码'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='编码'
                            disabled
                            value={this.state.entity.code}
                            maxLength={consts.MinTextLength}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'名称'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='名称'
                            disabled
                            value={this.state.entity.name}
                            maxLength={consts.MinTextLength}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'联系人'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='联系人'
                            disabled
                            value={this.state.entity.contact}
                            maxLength={consts.MinTextLength}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'联系电话'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='联系电话'
                            disabled
                            value={this.state.entity.contactNumber}
                            maxLength={consts.MinTextLength}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'邮箱'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='邮箱'
                            disabled
                            value={this.state.entity.email}
                            maxLength={consts.MinTextLength}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'启用/禁用'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Switch
                            checkedChildren='启用'
                            unCheckedChildren='禁用'
                            disabled
                            checked={this.state.entity.isActive}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='扩展信息' style={{ width: '100%' }}>
                    <ExtraInfo
                        show
                        extraInfo={this.state.entity.extraInfo}
                        onChange={extraInfo => {
                            this.state.entity.extraInfo = extraInfo;
                            this.setState({});
                        }}
                    />
                </CardEX>
            </div>
        </Modal>
    }
}

export default OpenNewKey(Page);