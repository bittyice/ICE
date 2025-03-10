import React from 'react';
import { Button, Tag, Card, Timeline } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { LabelValues } from 'ice-core';
import { iceFetch, Tool } from 'ice-common';

export default class extends React.Component {
    state = {
        logs: [] as Array<any>
    }

    componentDidMount() {
        this.fetchLogs();
    }

    fetchLogs = () => {
        iceFetch<Array<any>>(`/api/auth/identity-security-log/recent-login-log-list`, {
            method: 'GET',
        }).then((values) => {
            let list = [] as Array<any>;
            for (let n = 0; n < values.length; n++) {
                if (n >= 7) {
                    break;
                }
                list.push(values[n]);
            }

            this.setState({
                logs: list
            });
        });
    }

    render(): React.ReactNode {
        return <Card
            className='wms-home-login-log shadow-md'
            title={<div className='pt-4 pb-4 flex justify-between'>
                <div>
                    <div>登录日志</div>
                    <div className='text-xs font-medium mt-2 text-gray-500'>最近登录日志</div>
                </div>
                <AppstoreAddOutlined style={{ fontSize: 16 }} />
            </div>}
            style={{ width: '100%' }}>
            <div style={{ marginTop: 15 }}></div>
            <Timeline>
                {
                    this.state.logs.map(log => (
                        <Timeline.Item>{Tool.dateFormat(log.creationTime)} 登录系统</Timeline.Item>
                    ))
                }
            </Timeline>
        </Card>
    }
}