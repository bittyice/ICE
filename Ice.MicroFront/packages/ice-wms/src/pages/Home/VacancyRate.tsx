import React, { useEffect, useRef, useState } from 'react';
import { Typography, Timeline, Card, Table, Space } from 'antd';
import { ArrowRightOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { Column, Pie, Bar } from '@ant-design/plots';
import { iceFetch } from 'ice-common';
import { useSelector } from 'react-redux';

type DataType = { value: number, type: string };

const VacancyRate = (props: { warehouseId: string }) => {
  const [data, setData] = useState<Array<DataType>>([]);

  useEffect(() => {
    iceFetch<any>(`/api/wms/kanban/vacancy-rate?warehouseId=${props.warehouseId}`).then((values) => {
      let data: Array<DataType> = [];
      data.push({
        value: values.quantity,
        type: '空置'
      });
      data.push({
        value: values.total - values.quantity,
        type: '非空置'
      });
      setData(data);
    });
  }, []);

  const config = {
    appendPadding: 10,
    data,
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

  return <Card
    title={
      <div className='pt-4 pb-4 flex justify-between'>
        <div>
          <div>库位空置率</div>
          <div className='text-xs font-medium mt-2 text-gray-500'>当前仓库空置库位的比例</div>
        </div>
        <AppstoreAddOutlined style={{ fontSize: 16 }} />
      </div>
    }
  >
    <Pie height={350} {...config} />
  </Card>
};

export default VacancyRate;