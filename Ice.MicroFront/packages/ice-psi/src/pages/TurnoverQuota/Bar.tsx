import React, { useState, useEffect } from 'react';
import { Column } from '@ant-design/plots';

type DataType = {label: string, value: number, type: string};

const OrderTrend = (props: {datas: Array<any>}) => {
  const config = {
    data: props.datas,
    xField: 'label',
    yField: 'value',
    seriesField: 'type',
    isGroup: 'true',
  };

  // @ts-ignore
  return <Column {...config} />;
};

export default OrderTrend;
