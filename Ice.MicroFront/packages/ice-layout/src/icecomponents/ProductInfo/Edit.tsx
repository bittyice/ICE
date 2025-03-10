import React, { useState } from 'react';
import { DatePicker, Card, Typography, InputNumber, TreeSelect, Select, Cascader, Tag, Table, Button, Space, Input, Modal, message, Switch } from 'antd';
import { Tool, iceFetch } from 'ice-common';
import { consts, ProductInfoApi, ProductInfoEntity, IceStateType, ProductClassifyHelper, ProductInfoHelper } from 'ice-core';
import { LabelEX, CardEX, OpenNewKey, ExtraInfo, ArrayInput } from 'ice-layout';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';

const AddUnboxProductModal = (props: {
    visible: boolean,
    onCancel: () => void,
    onOk: (sku: string) => void,
}) => {
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');

    const onOk = () => {
        if (sku) {
            return ProductInfoApi.getForSkus({
                skus: [sku]
            }).then(products => {
                if (products.length == 0) {
                    message.error(`找不到SKU: ${sku}`);
                    return;
                }
                props.onOk(products[0].sku!);
            });
        }

        if (name) {
            return ProductInfoApi.getForNames({
                names: [name]
            }).then(products => {
                if (products.length == 0) {
                    message.error(`找不到产品: ${name}`);
                    return;
                }
                props.onOk(products[0].sku!);
            });
        }

        message.error('请输入SKU或者产品名称');
    }

    return <Modal
        title='添加拆箱产品'
        open={props.visible}
        onCancel={props.onCancel}
        onOk={onOk}
    >
        <Typography.Paragraph type='warning'>请输入产品的SKU或名称进行添加</Typography.Paragraph>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
                placeholder='SKU'
                maxLength={consts.MinTextLength}
                showCount
                value={sku}
                onChange={e => {
                    setSku(e.currentTarget.value);
                }}
            />
            <span>-</span>
            <Input
                placeholder='产品名称'
                maxLength={consts.MinTextLength}
                showCount
                value={name}
                onChange={e => {
                    setName(e.currentTarget.value);
                }}
            />
        </div>
    </Modal>
}

type Props = {
    entity?: ProductInfoEntity,
    open: boolean,
    onCancel: () => void,
    onOk: () => void
};

type PageProps = {
    title: string,
    onSubmit: (entity: any) => Promise<void>,
    classifys: Array<any>
} & Props;

class PageModal extends React.Component<PageProps> {
    productClassifyHelper: ProductClassifyHelper;

    state = {
        loading: false,
        entity: {
            unboxProducts: [] as Array<any>
        } as ProductInfoEntity,
        treeClassifys: [] as Array<any>,
        showAddUnboxProductModal: false
    }

    constructor(props: PageProps) {
        super(props);
        this.productClassifyHelper = new ProductClassifyHelper(this.props.classifys);
    }

    componentDidMount(): void {
        if (!this.state.entity.unboxProducts) {
            return;
        }
        ProductInfoHelper.fetchProducts(this.state.entity.unboxProducts.map((e: any) => e.sku)).then(() => {
            this.setState({});
        });
        this.fetchEntity();
    }
    
    fetchEntity = () => {
        if (!this.props.entity?.id) {
            return;
        }

        return ProductInfoApi.get(this.props.entity.id).then((e) => {
            this.setState({ entity: e });
        }).catch((ex) => {
        });
    }

    checkForm = () => {
        if (!this.state.entity.sku) {
            message.error('请输入SKU');
            return false;
        }

        if (this.state.entity.sku.length > 30) {
            message.error('SKU太长了，请重新编辑后提交');
            return false;
        }

        if (!this.state.entity.name) {
            message.error('请输入产品名');
            return false;
        }

        if (this.state.entity.price === undefined || this.state.entity.price === null) {
            message.error('请输入产品价格');
            return false;
        }

        if (this.state.entity.unboxProducts) {
            for (let item of this.state.entity.unboxProducts) {
                if (!item.quantity) {
                    message.error('请输入拆箱产品数量');
                    return;
                }
            }
        }

        return true;
    }

    // 自动生成 sku
    createSkuClick = () => {
        let timestr = Tool.dateFormat(new Date(), 'yyMMddhhmmss');

        this.state.entity.sku = timestr || undefined;
        this.setState({});
    }

    render() {
        return <Modal
            title={this.props.title}
            confirmLoading={this.state.loading}
            open={this.props.open}
            maskClosable={false}
            width={450}
            onCancel={this.props.onCancel}
            onOk={() => {
                if (!this.checkForm()) {
                    return;
                }

                this.setState({ loading: true });
                return this.props.onSubmit(this.state.entity).finally(() => {
                    this.setState({ loading: false });
                });
            }}
        >
            <div>
                <CardEX title='基本信息'>
                    <LabelEX isMust text={'SKU'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            disabled={!!this.props.entity?.id}
                            addonAfter={<Button disabled={!!this.props.entity?.id} type='primary' size='small' onClick={this.createSkuClick}>自动生成</Button>}
                            placeholder='SKU'
                            value={this.state.entity.sku}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.sku = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'产品名'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='产品名'
                            value={this.state.entity.name}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.name = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX isMust text={'产品价格'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder='产品价格'
                            min={0}
                            value={this.state.entity.price}
                            onChange={(val) => {
                                this.state.entity.price = val!;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'计量单位'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='示例：件、箱、托'
                            value={this.state.entity.unit}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.unit = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'体积'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder='体积'
                            precision={2}
                            min={0}
                            value={this.state.entity.volume}
                            onChange={(val) => {
                                this.state.entity.volume = val || undefined;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'体积单位'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='体积单位'
                            value={this.state.entity.volumeUnit}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.volumeUnit = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'重量'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder='重量'
                            min={0}
                            value={this.state.entity.weight}
                            onChange={(val) => {
                                this.state.entity.weight = val || undefined;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'重量单位'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='重量单位'
                            value={this.state.entity.weightUnit}
                            maxLength={consts.MinTextLength}
                            showCount
                            onChange={(e) => {
                                this.state.entity.weightUnit = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'品牌'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <Input
                            placeholder='品牌'
                            allowClear
                            style={{ width: '100%' }}
                            value={this.state.entity.brand}
                            onChange={(e) => {
                                this.state.entity.brand = e.currentTarget.value;
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                    <LabelEX text={'分类'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <TreeSelect
                            placeholder='分类'
                            allowClear
                            style={{ width: '100%' }}
                            treeDefaultExpandAll
                            treeData={this.productClassifyHelper.treeClassifys}
                            fieldNames={{
                                label: 'name',
                                value: 'id',
                                children: 'children'
                            }}
                            value={this.state.entity.classifyId}
                            onChange={(val) => {
                                this.state.entity.classifyId = val;
                                this.setState({});
                            }}
                        >
                        </TreeSelect>
                    </LabelEX>
                    <LabelEX text={'规格'} style={{ width: '100%' }} tagStyle={{ width: 100, textAlign: 'end' }}>
                        <ArrayInput
                            placeholder='规格'
                            value={this.state.entity.specification ? this.state.entity.specification.split(' ') : []}
                            onChange={(arr) => {
                                this.state.entity.specification = arr.join(' ');
                                this.setState({});
                            }}
                        />
                    </LabelEX>
                </CardEX>
                <CardEX title='扩展信息'>
                    <ExtraInfo extraInfo={this.state.entity.extraInfo}
                        onChange={extraInfo => {
                            this.state.entity.extraInfo = extraInfo;
                            this.setState({});
                        }}
                    />
                </CardEX>
                <CardEX title='拆箱产品'>
                    <Space>
                        <Button onClick={() => {
                            this.setState({ showAddUnboxProductModal: true });
                        }}>添加</Button>
                        <Typography.Text type='warning'>即：这个产品拆开后有什么产品</Typography.Text>
                    </Space>
                    <Table
                        size='small'
                        style={{ width: '100%' }}
                        dataSource={this.state.entity.unboxProducts}
                        columns={[{
                            title: 'SKU',
                            dataIndex: 'sku',
                            key: 'sku'
                        }, {
                            title: '名称',
                            dataIndex: 'name',
                            key: 'name',
                            render: (val, row) => {
                                return ProductInfoHelper.skuToProducts[row.sku!]?.name;
                            }
                        }, {
                            title: '数量',
                            dataIndex: 'quantity',
                            key: 'quantity',
                            render: (val, row) => {
                                return <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    precision={0}
                                    value={row.quantity}
                                    onChange={val => {
                                        row.quantity = val || undefined;
                                        this.setState({});
                                    }}
                                />
                            }
                        }, {
                            title: '操作',
                            key: 'action',
                            render: (val, row, index) => {
                                return <Button danger size='small' icon={<DeleteOutlined />} onClick={() => {
                                    this.state.entity.unboxProducts = [...this.state.entity.unboxProducts!];
                                    this.state.entity.unboxProducts.splice(index, 1);
                                    this.setState({});
                                }}></Button>
                            }
                        }]}
                        pagination={false}
                    />
                </CardEX>
                <AddUnboxProductModal
                    visible={this.state.showAddUnboxProductModal}
                    onCancel={() => {
                        this.setState({ showAddUnboxProductModal: false });
                    }}
                    onOk={(sku) => {
                        this.state.entity.unboxProducts = [...this.state.entity.unboxProducts!];
                        this.state.entity.unboxProducts.push({
                            sku: sku,
                            quantity: 0
                        });
                        this.setState({ showAddUnboxProductModal: false });
                        ProductInfoHelper.fetchProducts([sku]).then(() => {
                            this.setState({})
                        });
                    }}
                />
            </div>
        </Modal>
    }
}

export const Edit = OpenNewKey((props: Props) => {
    const classifys = useSelector((state: IceStateType) => state.classify.allDatas) || [];

    const onSubmit = async (entity: any) => {
        await ProductInfoApi.update(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title={`编辑 - ${props.entity?.sku}`}
        onSubmit={onSubmit}
        classifys={classifys}
    />
})

export const Add = OpenNewKey((props: Props) => {
    const classifys = useSelector((state: IceStateType) => state.classify.allDatas) || [];

    const onSubmit = async (entity: any) => {
        await ProductInfoApi.create(entity);
        message.success('成功');
        props.onOk();
    }

    return <PageModal
        {...props}
        title='添加'
        onSubmit={onSubmit}
        classifys={classifys}
    />
})
