import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, Radio, theme, Stack } from 'native-base';
import { Storage } from 'ice-common';
import DateTimePicker from '@react-native-community/datetimepicker';

import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem, Item, InputSelect, SelectItem } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { OutboundOrderApi, PickListApi, ProductInfoHelper } from 'ice-core';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>名称</Text>
        <Text style={styles.ListItemText2}>数量</Text>
        <Text style={styles.ListItemText3}>已分拣数量</Text>
    </View>
}

const ListItem = (props: { data: any, onClick: (data: any) => void }) => {
    let { item, index } = props.data;

    return <TouchableOpacity style={styles.ListItem}
        onPress={() => {
            props.onClick(item);
        }}
    >
        <Text style={styles.ListItemText1}>{ProductInfoHelper.skuToProducts[item.sku]?.name || ''}</Text>
        <Text style={styles.ListItemText2}>{item.quantity}</Text>
        <Text style={styles.ListItemText3}>{item.curSortedQuantity}</Text>
    </TouchableOpacity>
}

type Props = {
    location: any,
    navigate: (url: any) => void,
};

class SortingAction extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;

    state = {
        id: this.props.location.state.pickList.id,
        // 禁用回车，防止误点击
        disabledEnter: false,
        loading: false,
        entity: {
            pickListNumber: ''
        } as any,
        pickDetails: [] as Array<any>,
        // 关联的出库单
        outboundOrders: [] as Array<any>,
        // 分拣数据
        sorting: {
            sku: '',
            sortingQuantity: 0,
            outboundOrder: '',
        },
        // 显示完成模态
        showFinish: false,
    }

    componentDidMount() {
        this.fetchEntity();
        this.fetchOutboundOrders();
        this.input1Ref?.focus();
    }

    findSortingOrder = () => {
        // 可以选择的出库单(订单)
        for (let n = 0; n < this.state.outboundOrders.length; n++) {
            let outbountOrder = this.state.outboundOrders[n];
            for (let outboundDetail of outbountOrder.outboundDetails) {
                if (outboundDetail.sku == this.state.sorting.sku) {
                    let quantity = outboundDetail.sortedQuantity - outboundDetail.curSortedQuantity;
                    if (quantity <= 0) {
                        continue;
                    }
                    this.state.sorting.sortingQuantity = quantity;
                    this.state.sorting.outboundOrder = outbountOrder.id;
                    Toast.show({
                        title: `请把SKU为 ${outboundDetail.sku} 的 ${quantity} 个产品放到 ${outbountOrder.index} 号篮中`
                    })
                    this.setState({ disabledEnter: true });
                    setTimeout(() => {
                        this.setState({ disabledEnter: false });
                    }, 2000)
                    this.input2Ref?.focus();
                    return true;
                }
            }
        }

        Toast.show({
            title: `无法将 ${this.state.sorting.sku} 放入到任何一个订单中，请确认是否误拣或多拣了某个产品`
        });
        return false;
    }

    // 请求实体
    fetchEntity = () => {
        return PickListApi.get(this.state.id).then((val) => {
            this.setState({ entity: val });
            return val;
        });
    }

    fetchOutboundOrders = () => {
        return OutboundOrderApi.getListWithDetailsForPickId(this.state.id).then((datas) => {
            datas.sort((l: any, r: any) => (l.outboundNumber > r.outboundNumber ? 1 : 0))

            datas.forEach((item: any, i: number) => {
                item.index = i + 1;
                item.outboundDetails.forEach((detail: any) => {
                    detail.curSortedQuantity = 0;
                });
            });
            this.setState({
                outboundOrders: datas
            });
        }).then(() => {
            let pickDetails: Array<any> = [];
            this.state.outboundOrders.forEach(item => {
                item.outboundDetails.forEach((detail: any) => {
                    let pickDetail = pickDetails.find(e => e.sku == detail.sku)
                    if (!pickDetail) {
                        pickDetail = { sku: detail.sku, quantity: 0, curSortedQuantity: 0 };
                        pickDetails.push(pickDetail);
                    }
                    pickDetail.quantity = pickDetail.quantity + detail.sortedQuantity;
                });
            });
            let skus: Array<string> = pickDetails.map(e => e.sku);
            this.setState({ pickDetails: pickDetails });
            return ProductInfoHelper.fetchProducts(skus).then(() => {
                this.setState({});
            });
        });
    }

    fetchSorting = () => {
        if (this.state.disabledEnter) {
            Toast.show({
                title: '你点击太快了，请确认数量并将产品放入订单中'
            });
            return;
        }

        if (!this.state.sorting.sku) {
            Toast.show({
                title: '请输入SKU'
            });
            return;
        }

        if (!this.state.sorting.outboundOrder) {
            Toast.show({
                title: '请选择分拣订单'
            });
            return;
        }

        if (!this.state.sorting.sortingQuantity) {
            Toast.show({
                title: '请输入分拣数量'
            });
            return;
        }

        let outboundOrderId = this.state.sorting.outboundOrder;
        let outboundOrder = this.state.outboundOrders.find(e => e.id == outboundOrderId);
        if (!outboundOrder) {
            Toast.show({
                title: '找不到对应的出库单'
            })
            return;
        }

        let detail = outboundOrder.outboundDetails.find((detail: any) => detail.sku == this.state.sorting.sku);
        if (!detail) {
            Toast.show({
                title: '所选出库单不包含当前要分拣的SKU'
            })
            return;
        }

        if (detail.sortedQuantity < (detail.curSortedQuantity + this.state.sorting.sortingQuantity)) {
            Toast.show({
                title: `当前出库单只需要${detail.sortedQuantity - detail.curSortedQuantity}个该SKU`
            });
            return;
        }

        detail.curSortedQuantity = detail.curSortedQuantity + this.state.sorting.sortingQuantity;
        let pickDetail = this.state.pickDetails.find(e => e.sku == this.state.sorting.sku);
        if (pickDetail) {
            pickDetail.curSortedQuantity = pickDetail.curSortedQuantity + this.state.sorting.sortingQuantity;
        }
        Toast.show({
            title: '分拣成功'
        });
        this.state.sorting.sku = '';
        this.state.sorting.sortingQuantity = 0;
        this.setState({});
        this.input1Ref?.focus();

        for (let outbountOrder of this.state.outboundOrders) {
            for (let outboundDetail of outbountOrder.outboundDetails) {
                // 如果有某个已分拣数量小于需分拣数量，则返回
                if (outboundDetail.curSortedQuantity < outboundDetail.sortedQuantity) {
                    return true;
                }
            }
        }

        this.setState({ showFinish: true });
        return true;
    }

    render() {
        return <Layout
            title={`分拣 - ${this.props.location.state.pickList.pickListNumber}`}
        >
            <View flexGrow={1} flexShrink={1}>
                <Item><Text>在进行分拣前，你需要准备{this.state.outboundOrders.length}个篮子用于分拣</Text></Item>
                <ListHeader />
                <View h={1} flexGrow={1} flexShrink={1}>
                    <FlatList
                        data={this.state.pickDetails}
                        renderItem={(item) => {
                            return <ListItem data={item} onClick={(data) => {
                                this.state.sorting.sku = data.sku;
                                this.setState({}, () => {
                                    this.findSortingOrder();
                                });
                            }} />
                        }}
                    />
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    <InputSelect
                        iref={r => this.input1Ref = r}
                        text='SKU'
                        values={this.state.pickDetails.map((item: any) => ({
                            label: ProductInfoHelper.skuToProducts[item.sku]?.name,
                            value: item.sku
                        }))}
                        value={this.state.sorting.sku}
                        onChange={(value) => {
                            this.state.sorting.sku = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            if (this.findSortingOrder()) {
                                this.input2Ref?.focus();
                            }
                        }}
                    />
                    <Item style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text>{`名称: ${ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.name || ''}`}</Text>
                        <Text>{`计量单位: ${ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.unit || ''}`}</Text>
                        <Text>{`体积: ${ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.volume || ''} ${ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.volumeUnit || '--'}`}</Text>
                        <Text>{`重量: ${ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.weight || ''} ${ProductInfoHelper.skuToProducts[this.state.sorting.sku]?.weightUnit || '--'}`}</Text>
                    </Item>
                    <SelectItem
                        text='分拣订单'
                        values={this.state.outboundOrders.map(item => ({ label: `订单${item.index} : ${item.outboundNumber.substr(-4)}`, value: item.id }))}
                        value={this.state.sorting.outboundOrder}
                        onChange={val => {
                            this.state.sorting.outboundOrder = val;
                            this.setState({});
                        }}
                    />
                    <InputNumberItem
                        iref={r => this.input2Ref = r}
                        text='分拣数量'
                        value={this.state.sorting.sortingQuantity}
                        onChange={(value) => {
                            this.state.sorting.sortingQuantity = value || 0;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            if (this.fetchSorting()) {
                                this.input1Ref?.focus();
                            }
                        }}
                    />
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button borderRadius={0} width='100%' size='lg' onPress={this.fetchSorting}>拣货</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showFinish}
                            title='提示'
                            message='拣货单已全部分拣完成，点击确认返回上一页'
                            onCancel={() => {
                                this.setState({ showFinish: false });
                            }}
                            onOk={() => {
                                this.setState({ showFinish: false });
                                this.props.navigate(-1);
                            }}
                        />
                    </HStack>
                </View>
            </View>
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
    }
});

export default () => {
    const location = useLocation();
    const navigate = useNavigate();

    return <SortingAction
        location={location}
        navigate={navigate}
    />
}