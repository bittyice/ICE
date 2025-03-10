import React, { useState, useEffect } from 'react';
import { Pie } from '@ant-design/plots';

const VacancyRate = (props: { data: Array<any> }) => {
  const config = {
    appendPadding: 10,
    data: props.data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
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

  return <Pie height={300} {...config} />;
};

export default VacancyRate;