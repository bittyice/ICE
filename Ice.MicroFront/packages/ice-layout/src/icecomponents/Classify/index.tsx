import React, { useState, useEffect } from 'react';
import { Col, Menu, Space, Button, Input, Tabs, Table, Tag, Pagination, Divider, Modal, DatePicker, message, Switch } from 'antd';
import { AppstoreAddOutlined, NumberOutlined, PlusOutlined, DeleteOutlined, EditOutlined, DeleteFilled } from '@ant-design/icons';
import {
    DogEar,
} from 'ice-layout';
import { ClassifyApi, ClassifyEntity, classifySlice, IceStateType, consts, ProductClassifyHelper } from 'ice-core';
import { useSelector, useDispatch } from 'react-redux';
import './index.css';

const AddOrEditModal = (props: {
    title: string,
    row: any,
    visible: boolean,
    onCancel: () => void,
    onOk: (name: string) => Promise<any>,
}) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName(props.row?.name);
    }, []);

    return <Modal
        title={props.title}
        confirmLoading={loading}
        width={300}
        open={props.visible}
        onCancel={props.onCancel}
        onOk={() => {
            if (!name) {
                message.error('请输入名称');
                return;
            }

            setLoading(true);
            props.onOk(name).finally(() => {
                setLoading(false);
            });
        }}
    >
        <Input
            placeholder='请输入名称'
            value={name}
            onChange={(e) => {
                setName(e.currentTarget.value);
            }}
        />
    </Modal>
}

const ClassifyItem = (props: {
    classify: any,
    onAdd: (classify: any) => void,
    onEdit: (classify: any) => void,
    onDelete: (classify: any) => void,
}) => {
    const createMenuItem = (childClassify: any) => {
        if (!childClassify.children || childClassify.children.length == 0) {
            return <Menu.Item>
                <div style={{ display: 'flex', minWidth: 150, alignItems: 'center' }}>
                    <span>{childClassify.name}</span>
                    <div style={{ flexGrow: 1 }} />
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => props.onAdd(childClassify)}
                    ></Button>
                    <Button type='link' icon={<EditOutlined />}
                        onClick={() => props.onEdit(childClassify)}
                    ></Button>
                    <Button danger type='link' icon={<DeleteOutlined />} style={{ width: 15, marginLeft: 5 }}
                        onClick={() => props.onDelete(childClassify)}
                    ></Button>
                </div>
            </Menu.Item>
        }
        else {
            return <Menu.SubMenu title={<div style={{ display: 'flex', justifyContent: 'space-between', minWidth: 150 }}>
                <span>{childClassify.name}</span>
                <Space size={0}>
                    <Button type='link' icon={<PlusOutlined />}
                        onClick={() => props.onAdd(childClassify)}
                    ></Button>
                    <Button type='link' icon={<EditOutlined />}
                        onClick={() => props.onEdit(childClassify)}
                    ></Button>
                </Space>
            </div>}>
                {
                    childClassify.children.map((item: any) => {
                        return createMenuItem(item);
                    })
                }
            </Menu.SubMenu>
        }
    }

    return <div className='classify-item'>
        <div style={{ backgroundColor: '#1890ff', padding: '5px 0px', alignItems: 'center', display: 'flex' }}>
            <Button type='text' icon={<EditOutlined />} style={{ color: '#fff' }}
                onClick={() => props.onEdit(props.classify)}
            >
                {props.classify.name}
            </Button>
            <div style={{ flexGrow: 1 }}></div>
            <Button ghost icon={<DeleteFilled />} style={{ zIndex: 999, marginRight: 10, color: '#fff', borderColor: '#fff' }} shape="circle" size='small'
                onClick={() => props.onDelete(props.classify)}
            ></Button>
        </div>
        <Menu className='classify-item-menus' mode='inline'>
            {
                props.classify.children?.map((item: any) => createMenuItem(item))
            }
        </Menu>
        <div>
            <Button block type='primary' style={{ height: 34 }} icon={<AppstoreAddOutlined />}
                onClick={() => props.onAdd(props.classify)}
            >添加子分类</Button>
        </div>
        <DogEar borderWidth={20} />
    </div>
}

type Props = {
    classifys: Array<ClassifyEntity>,
    fetchClassifys: () => Promise<any>
};

class Classify extends React.Component<Props> {
    productClassifyHelper: ProductClassifyHelper;

    state = {
        tableKey: 0,
        // 选择的数据行
        selectRows: [],
        // 显示添加模特框
        showAdd: false,
        // 显示编辑模块框
        showEdit: false,
        // 要查看或编辑的数据
        row: (null as any),
    }

    constructor(props: Props) {
        super(props);
        this.productClassifyHelper = new ProductClassifyHelper(this.props.classifys);
    }

    componentDidMount() {
        this.props.fetchClassifys().then(() => {
            this.productClassifyHelper = new ProductClassifyHelper(this.props.classifys);
            this.setState({});
        });
    }

    fetchDelete = (row: any) => {
        Modal.confirm({
            title: `删除分类 - ${row.name}`,
            content: '确定删除分类吗',
            onOk: async () => {
                await ClassifyApi.delete(row.id);
                message.success('删除成功');
                await this.props.fetchClassifys();
                this.productClassifyHelper = new ProductClassifyHelper(this.props.classifys);
                this.setState({});
            }
        });
    }

    fetchAdd = async (name: string) => {
        await ClassifyApi.create({
            parentId: this.state.row?.id,
            name: name
        });
        message.success('添加成功');
        this.setState({
            showAdd: false,
        });
        await this.props.fetchClassifys();
        this.productClassifyHelper = new ProductClassifyHelper(this.props.classifys);
        this.setState({});
    }

    fetchEdit = async (name: string) => {
        await ClassifyApi.update({
            id: this.state.row?.id,
            name: name
        });
        message.success('编辑成功');
        this.setState({
            showEdit: false,
        });
        await this.props.fetchClassifys();
        this.productClassifyHelper = new ProductClassifyHelper(this.props.classifys);
        this.setState({});
    }

    render() {
        return <div>
            <div className='classify-body'>
                {
                    this.productClassifyHelper.treeClassifys.map((item) => (<ClassifyItem classify={item}
                        onAdd={(item) => {
                            this.setState({
                                showAdd: true,
                                row: item
                            });
                        }}
                        onEdit={(item) => {
                            this.setState({
                                showEdit: true,
                                row: item
                            });
                        }}
                        onDelete={(item) => {
                            this.fetchDelete(item);
                        }}
                    />))
                }
                <div className='classify-item'>
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <AppstoreAddOutlined style={{ fontSize: 30 }} />
                    </div>
                    <div>
                        <Button block type='primary' style={{ height: 34 }} icon={<AppstoreAddOutlined />}
                            onClick={() => this.setState({ showAdd: true, row: null })}
                        >添加主分类</Button>
                    </div>
                    <DogEar borderWidth={20} />
                </div>
            </div>
            {/* 添加 */}
            <AddOrEditModal
                title={`添加${this.state.row ? ` - ${this.state.row.name}` : ''}`}
                row={null}
                visible={this.state.showAdd}
                onCancel={() => {
                    this.setState({
                        showAdd: false,
                    });
                }}
                onOk={this.fetchAdd}
            />
            {/* 编辑 */}
            {
                this.state.row && <AddOrEditModal
                    title='编辑'
                    key={this.state.row?.id}
                    row={this.state.row}
                    visible={this.state.showEdit}
                    onCancel={() => {
                        this.setState({
                            showEdit: false,
                        });
                    }}
                    onOk={this.fetchEdit}
                />
            }
        </div>
    }
}

export default () => {
    const classifys = useSelector((state: IceStateType) => state.classify.allDatas) || [];
    const dispatch = useDispatch();
    const fetchClassifys = async () => {
        await dispatch(classifySlice.asyncActions.fetchAllDatas({ enforce: true }) as any);
    }

    return <Classify
        classifys={classifys}
        fetchClassifys={fetchClassifys}
    />
}
