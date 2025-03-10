import React from 'react';
import { Button, Tag, Card, Timeline } from 'antd';
import { LabelValues, enums } from 'ice-core';
import { iceFetch, Tool } from 'ice-common';

export default class extends React.Component {
    state = {
        logs: [] as Array<any>
    }

    componentDidMount() {
        this.fetchLogs();
    }

    fetchLogs = () => {
        iceFetch<Array<any>>(`/api/auth/identity-security-log/recent-login-log-list`).then((values) => {
            let list: Array<any> = [];
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
        return <Card className='wms-home-login-log shadow' title='登录日志' style={{ width: '25%' }}>
            <div style={{ marginTop: 15 }}></div>
            <Timeline>
                {
                    this.state.logs.map(log => (
                        <Timeline.Item>{Tool.dateFormat(log.creationTime)}</Timeline.Item>
                    ))
                }
            </Timeline>
        </Card>
    }
}