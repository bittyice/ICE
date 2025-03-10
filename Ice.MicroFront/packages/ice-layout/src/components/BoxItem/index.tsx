import React from 'react';
import { Space } from 'antd';
import { EllipsisOutlined, ArrowRightOutlined } from '@ant-design/icons';
import DogEar from '../DogEar';

type TopItemProps = {
    color: string,
    children: React.ReactNode | Array<React.ReactNode>
}

export const BoxItem = (props: TopItemProps) => {
    return <div
        className='shadow'
        style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: 16,
            backgroundColor: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <DogEar borderWidth={25} color={`${props.color}80`} text={<EllipsisOutlined />} />
        {props.children}
        <div style={{
            width: 50,
            height: 50,
            backgroundColor: `${props.color}10`,
            borderRadius: 100,
            position: 'absolute',
            bottom: 0,
            right: 0
        }} />
        <div style={{
            width: 70,
            height: 70,
            backgroundColor: '#722ed110',
            borderRadius: 100,
            position: 'absolute',
            bottom: 20,
            right: 5
        }} />
    </div>
}

export const Box2Item = (props: {
    width?: number,
    color: string,
    children: React.ReactNode | Array<React.ReactNode>
}) => {
    return <div className='shadow-md' style={{ width: props.width || 150, height: props.width || 150, backgroundColor: '#fff', color: props.color, borderRadius: 10, padding: 15, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {props.children}
        <div style={{
            width: 50,
            height: 50,
            backgroundColor: `${props.color}40`,
            borderRadius: 100,
            position: 'absolute',
            bottom: -10,
            right: -10
        }} />
    </div>
}