import React from 'react';
//@ts-ignore
import nocontent from './nocontent.png';

class NoContent extends React.Component<{}> {
    render() {
        return <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#a08c8c'
        }}>
            <img src={nocontent} style={{ width: '60%' }} />
            <div style={{ marginTop: 10 }}>页面正在开发中...</div>
        </div>
    }
}

export default NoContent