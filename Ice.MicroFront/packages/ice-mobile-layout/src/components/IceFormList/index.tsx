import React from 'react';
import { Form } from 'antd-mobile';

const IceForm = (props: {
    columns: Array<any>,
    data: any,
    index: number
}) => {
    let cols = props.columns;
    let items: Array<React.ReactNode> = [];
    for (let n = 0; n < cols.length; n++) {
        const col = cols[n];
        let content;
        if (col.render) {
            content = col.render(props.data[col.dataIndex], props.data, props.index);
        }
        else {
            content = props.data[col.dataIndex]
        }
        items.push(
            <Form.Item label={col.title}>
                {content}
            </Form.Item>
        );
    }

    return <Form layout='horizontal'>
        {items}
    </Form>
}

export default (props: {
    columns: Array<any>,
    dataSource: Array<any>
}) => {
    return <div className='w-full flex flex-col gap-4'>
        {
            props.dataSource.filter(e => e).map((item, index) => <IceForm columns={props.columns} data={item} index={index} />)
        }
    </div>
}