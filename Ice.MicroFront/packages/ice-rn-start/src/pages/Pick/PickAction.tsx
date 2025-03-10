import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, Radio, theme, Stack } from 'native-base';
import { Storage, Tool } from 'ice-common';
import DateTimePicker from '@react-native-community/datetimepicker';

import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem, Item, InputSelect, SelectItem } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';
import { IceStateType, OutboundOrderApi, PickListApi, AlgorithmType, CreatePickPath, PickPathItemType, ProductInfoHelper } from 'ice-core';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import LocationInput from '../../components/LocationInput';
import SelectEX from '../../components/SelectEX';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>SKU</Text>
        <Text style={styles.ListItemText2}>需拣数量</Text>
        <Text style={styles.ListItemText3}>已拣数量</Text>
    </View>
}

const ListItem = (props: { data: any, onClick: (data: any) => void }) => {
    let { item, index } = props.data;

    return <TouchableOpacity style={styles.ListItem}
        onPress={() => {
            props.onClick(item);
        }}
    >
        <Text style={styles.ListItemText1}>{item.sku}</Text>
        <Text style={styles.ListItemText2}>{item.quantity}</Text>
        <Text style={styles.ListItemText3}>{item.sortedQuantity}</Text>
    </TouchableOpacity>
}

const renderTabBar = (props: any) => (
    <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.colors.blue[500] }}
        style={{ backgroundColor: '#fff' }}
        activeColor={theme.colors.blue[500]}
        inactiveColor='#3e3e3e'
    />
);

type PickPathProps = {
    algorithmType: string,
    onAlgorithmChange: (algorithmType: string) => void,
    rebuildPickPaths: () => Promise<void>,
    pickPaths: Array<PickPathItemType>,
    onClick: (pickPath: PickPathItemType) => void
}

const PickPath = (props: PickPathProps) => {
    return <View h={1} flexGrow={1} flexShrink={1}>
        <Item>
            <Stack
                direction='row'
                alignItems='center'
                space={4}
            >
                <Text>拣货路径</Text>
                <Radio.Group
                    name='path'
                    value={props.algorithmType}
                    onChange={(val) => {
                        props.onAlgorithmChange(val);
                    }}
                >
                    <Stack
                        direction='row'
                        alignItems='center'
                        space={2}
                    >
                        <Radio size='sm' value='Location'>库位顺序</Radio>
                        <Radio size='sm' value='Quantity'>较少优先</Radio>
                        <Radio size='sm' value='InboundBatch'>批次优先</Radio>
                    </Stack>
                </Radio.Group>
                <TouchableOpacity onPress={props.rebuildPickPaths}><Text color='blue.500'>刷新</Text></TouchableOpacity>
            </Stack>
        </Item>
        <View h={1} flexGrow={1} flexShrink={1}>
            <FlatList
                data={props.pickPaths}
                renderItem={(renderItem) => {
                    let item = renderItem.item;
                    return (<TouchableOpacity
                        onPress={() => {
                            props.onClick(item);
                        }}
                    >
                        <Item>
                            <Text>
                                {`${item.locationCode} -> ${ProductInfoHelper.skuToProducts[item.sku]?.name || item.sku} -> ${item.needPickQuantity}个 -> ${item.orderIndex}号单[...${item.orderNumber.substring(item.orderNumber.length - 4)}]`}
                            </Text>
                        </Item>
                    </TouchableOpacity>)
                }}
            />
        </View>
    </View>
}

type Props = {
    warehouseId: string,
    location: any,
    navigate: (url: any) => void,
};

class OnshelfAction extends React.Component<Props> {
    pickPathStorageName = "PickPathAlgorithmType";
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;
    createPickPath!: CreatePickPath;

    state = {
        init: false,
        id: this.props.location.state.pickList.id,
        loading: false,
        // 拣货路径算法
        algorithmType: 'Location' as AlgorithmType,
        // 拣货数据
        pick: {
            sku: '',
            quantity: 0 as (number | null),
            locationCode: '',
            orderId: undefined as (string | undefined)
        },
        pickPathKey: 0,
        // 拣货路径
        pickPaths: [] as Array<PickPathItemType>,
        // 显示完成模态
        showFinish: false,
        // 显示强制模态
        showEnforce: false,
        index: 0,
    }

    async componentDidMount() {
        this.init();
    }

    async init() {
        if (!this.state.id) {
            return;
        }
        this.createPickPath = await new CreatePickPath();
        await this.createPickPath.init(this.state.id);
        await ProductInfoHelper.fetchProducts(this.createPickPath.pickDetails.map((e) => e.sku));
        this.input1Ref?.focus();
        let algorithmType = await Storage.getItem(this.pickPathStorageName);
        let pickPaths = this.createPickPath.createPickPaths(algorithmType as AlgorithmType);
        if (this.createPickPath.outboundOrders.length == 1) {
            this.state.pick.orderId = this.createPickPath.outboundOrders[0].id;
        }
        this.setState({ algorithmType: algorithmType, pickPaths: pickPaths, init: true });
    }

    // 拣货
    fetchPick = () => {
        if (!this.state.pick.orderId) {
            Toast.show({ title: "请选择要选择的订单" })
            return;
        }

        if (!this.state.pick.sku) {
            Toast.show({ title: "请输入SKU" })
            return;
        }

        if (!this.state.pick.quantity) {
            Toast.show({ title: "请输入拣货数量" })
            return;
        }

        if (!this.state.pick.locationCode) {
            Toast.show({ title: "请输入拣货库位" })
            return;
        }

        this.setState({ loading: true });
        let orderId = this.state.pick.orderId;
        let body = {
            id: orderId,
            "locationCode": this.state.pick.locationCode,
            "sku": this.state.pick.sku,
            "quantity": this.state.pick.quantity
        }
        return OutboundOrderApi.pick(body).then(() => {
            Toast.show({ title: "成功" })
            this.setState({
                pick: {
                    ...this.state.pick,
                    locationCode: '',
                    sku: '',
                    quantity: 0
                }
            }, () => {
                // 这是ant的一个bug，必须使用setTimeout
                setTimeout(() => {
                    this.input1Ref?.focus();
                }, 1);
            });
        }).then(() => {
            // 重新计算路径
            this.createPickPath.pick(orderId, body.sku, body.quantity, body.locationCode);
            let pickPaths = this.createPickPath.createPickPaths(this.state.algorithmType);
            this.setState({ pickPaths: pickPaths });
            if (pickPaths.length == 0) {
                this.setState({ showFinish: true });
            }
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 完成订单
    fetchFinishOnShelf = () => {
        return PickListApi.pickingDone(this.state.id).then(() => {
            Toast.show({ title: `拣货单：${this.createPickPath.pickList.pickListNumber}已完成拣货` });
            this.props.navigate(-1);
        });
    }

    renderScene = (props: { route: any }) => {
        if (props.route.key == 'action') {
            let skus: Array<string> = Array.from(new Set(this.createPickPath.pickDetails.map((e: any) => e.sku)));

            return <View flexGrow={1} flexShrink={1}>
                <View h={1} flexGrow={1} flexShrink={1}>
                    <PickPath
                        algorithmType={this.state.algorithmType}
                        onAlgorithmChange={(type) => {
                            Storage.setItem(this.pickPathStorageName, type);
                            let pickPaths = this.createPickPath.createPickPaths(type as AlgorithmType);
                            this.setState({ pickPaths: pickPaths, algorithmType: type });
                        }}
                        rebuildPickPaths={async () => {
                            await this.createPickPath.init(this.state.id!);
                            let pickPaths = this.createPickPath.createPickPaths(this.state.algorithmType as AlgorithmType);
                            this.setState({ pickPaths: pickPaths });
                        }}
                        pickPaths={this.state.pickPaths}
                        onClick={path => {
                            this.setState({
                                pick: {
                                    sku: path.sku,
                                    quantity: path.needPickQuantity,
                                    locationCode: path.locationCode,
                                    orderId: path.orderId
                                }
                            });
                        }}
                    />
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    <LocationInput
                        iref={r => this.input1Ref = r}
                        text='拣货库位'
                        value={this.state.pick.locationCode}
                        onChange={(value) => {
                            this.state.pick.locationCode = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input2Ref?.focus();
                        }}
                    />
                    <InputSelect
                        iref={r => this.input2Ref = r}
                        text='SKU'
                        values={skus.map((sku: string) => ({
                            label: ProductInfoHelper.skuToProducts[sku]?.name!,
                            value: sku!
                        }))}
                        value={this.state.pick.sku}
                        onChange={(value) => {
                            this.state.pick.sku = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input3Ref?.focus();
                        }}
                    />
                    <Item style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text>{`名称: ${ProductInfoHelper.skuToProducts[this.state.pick.sku]?.name || ''}`}</Text>
                        <Text>{`计量单位: ${ProductInfoHelper.skuToProducts[this.state.pick.sku]?.unit || ''}`}</Text>
                        <Text>{`体积: ${ProductInfoHelper.skuToProducts[this.state.pick.sku]?.volume || ''} ${ProductInfoHelper.skuToProducts[this.state.pick.sku]?.volumeUnit || '--'}`}</Text>
                        <Text>{`重量: ${ProductInfoHelper.skuToProducts[this.state.pick.sku]?.weight || ''} ${ProductInfoHelper.skuToProducts[this.state.pick.sku]?.weightUnit || '--'}`}</Text>
                    </Item>
                    <InputNumberItem
                        iref={r => this.input3Ref = r}
                        text='拣货数量'
                        value={this.state.pick.quantity}
                        onChange={(value) => {
                            this.state.pick.quantity = value || 0;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.fetchPick()?.then(() => {
                                this.input1Ref?.focus();
                            });
                        }}
                    />
                    <SelectItem
                        text='拣货订单'
                        values={this.createPickPath.outboundOrders.map((item: any) => ({
                            label: `${item.index}号单-${item.outboundNumber}`,
                            value: item.id
                        }))}
                        value={this.state.pick.orderId}
                        onChange={val => {
                            this.state.pick.orderId = val;
                            this.setState({});
                        }}
                    />
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button borderRadius={0} width='43%' size='lg' onPress={() => {
                            this.setState({ showEnforce: true });
                        }}>强制完成</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showEnforce}
                            title='提示'
                            message='强制完成拣货吗？该操作不可撤销'
                            onCancel={() => {
                                this.setState({ showEnforce: false });
                            }}
                            onOk={() => {
                                this.fetchFinishOnShelf().then(() => {
                                    this.setState({ showEnforce: false });
                                });
                            }}
                        />
                        <Button borderRadius={0} width='43%' size='lg' onPress={this.fetchPick}>拣货</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showFinish}
                            title='提示'
                            message='订单已拣完，是否完成拣货'
                            onCancel={() => {
                                this.setState({ showFinish: false });
                            }}
                            onOk={() => {
                                this.fetchFinishOnShelf().then(() => {
                                    this.setState({ showFinish: false });
                                });
                            }}
                        />
                    </HStack>
                </View>
            </View>;
        }

        return <ScrollView>
            {
                this.createPickPath.outboundOrders.map((order: any) => {
                    return <View>
                        <ListHeader />
                        <View>
                            <FlatList
                                data={order.outboundDetails}
                                renderItem={(item) => {
                                    return <ListItem data={item} onClick={(data) => {
                                        this.setState({
                                            pick: {
                                                sku: data.sku,
                                                quantity: (data.quantity - data.sortedQuantity),
                                                locationCode: data.locationCode,
                                                orderId: data.orderId
                                            }
                                        });
                                    }} />
                                }}
                            />
                        </View>
                    </View>
                })
            }

        </ScrollView>;
    };

    render() {
        return <Layout
            title={`拣货 - ${this.props.location.state.pickList.pickListNumber}`}
        >
            {
                this.state.init ?
                    <TabView
                        navigationState={{
                            index: this.state.index,
                            routes: [
                                { key: 'action', title: '拣货操作' },
                                { key: 'details', title: '拣货明细' },
                            ]
                        }}
                        renderScene={this.renderScene}
                        renderTabBar={renderTabBar}
                        onIndexChange={(index) => {
                            this.setState({ index: index });
                        }}
                    /> : <></>
            }
        </Layout>
    }
}

const styles = StyleSheet.create({
    ListItem: {
        backgroundColor: '#fff',
        paddingBottom: 12,
        paddingTop: 12,
        paddingLeft: 30,
        paddingRight: 30,
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f3f3',
        alignItems: 'center'
    },
    ListItemText1: {
        width: '50%'
    },
    ListItemText2: {
        width: '25%'
    },
    ListItemText3: {
        width: '25%'
    },
});

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const location = useLocation();
    const navigate = useNavigate();

    return <OnshelfAction
        warehouseId={warehouseId}
        location={location}
        navigate={navigate}
    />
}