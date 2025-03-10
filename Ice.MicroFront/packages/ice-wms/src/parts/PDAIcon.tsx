import React, { useState } from 'react';
import { Button } from 'antd';
import { AndroidOutlined } from '@ant-design/icons';

export default () => <Button className='text-gray-50' type='ghost' onClick={() => {
    window.open('http://app.bittyice.cn/iceapp');
}}><AndroidOutlined /></Button>