import React, { useState, useEffect } from 'react';
import { Pie } from '@ant-design/plots';

type DataType = { value: number, type: string };

const Rate = (props: { data: Array<DataType> }) => {
  const config = {
    appendPadding: 10,
    data: props.data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.7,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };

  return <Pie {...config} />;
};

export default Rate;