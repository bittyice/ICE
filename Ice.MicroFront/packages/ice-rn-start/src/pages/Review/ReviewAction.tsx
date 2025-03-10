import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, Radio, theme, Stack } from 'native-base';
import { Storage } from 'ice-common';
import DateTimePicker from '@react-native-community/datetimepicker';

import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem, Item, InputSelect } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { IceStateType, OutboundOrderApi, ProductInfoHelper } from 'ice-core';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>名称</Text>
        <Text style={styles.ListItemText2}>分拣数量</Text>
        <Text style={styles.ListItemText3}>是否复查</Text>
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
        <Text style={styles.ListItemText2}>{item.sortedQuantity}</Text>
        <Text style={styles.ListItemText3}>{item.reviewed ? '已复查' : '未复查'}</Text>
    </TouchableOpacity>
}

type Props = {
    warehouseId: string,
    location: any,
    navigate: (url: any) => void,
};

class SortingAction extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        id: this.props.location.state.outboundOrder.id,
        loading: false,
        entity: {
            outboundDetails: []
        } as any,
        // 复核数据
        review: {
            sku: '',
            quantity: null as (number | null),
        },
        // 显示完成模态
        showFinish: false,
        // 显示强制模态
        showEnforce: false,
    }

    componentDidMount() {
        this.fetchEntity().then(() => {
            return ProductInfoHelper.fetchProducts(this.state.entity.outboundDetails.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        });
        this.input1Ref?.focus();
    }

    // 请求实体
    fetchEntity = () => {
        return OutboundOrderApi.get(this.state.id).then((val) => {
            this.setState({ entity: val });
            return val;
        });
    }

    //复核
    review = () => {
        let outboundDetail = this.state.entity.outboundDetails.find((e: any) => e.sku == this.state.review.sku);
        if (!outboundDetail) {
            Toast.show({
                title: "该SKU不在出库单中，请确认是否拣错SKU了"
            });
            return false;
        }
        outboundDetail.reviewed = false;

        if (outboundDetail.sortedQuantity != this.state.review.quantity) {
            Toast.show({
                title: `订单中SKU的数量为${outboundDetail.sortedQuantity}，这与复查的SKU数量不同`
            });
            return false;
        }

        Toast.show({
            title: "复核通过，该SKU没有问题"
        });
        outboundDetail.reviewed = true;
        this.setState({
            review: {
                sku: '',
                quantity: undefined,
            }
        });

        // 检查明细项，查看是否还有未复核的明细
        if (!this.state.entity.outboundDetails.some((e: any) => e.reviewed != true)) {
            this.setState({ showFinish: true });
        }

        return true;
    }

    // 请求复核
    fetchReview = () => {
        return OutboundOrderApi.review(this.state.id).then(() => {
            Toast.show({
                title: "已完成复核"
            });
            this.fetchEntity();
            this.props.navigate(-1);
        });
    }
    render() {
        return <Layout
            title={`复核 - ${this.props.location.state.outboundOrder.outboundNumber}`}
        >
            <View flexGrow={1} flexShrink={1}>
                <ListHeader />
                <View h={1} flexGrow={1} flexShrink={1}>
                    <FlatList
                        data={this.state.entity.outboundDetails}
                        renderItem={(item) => {
                            return <ListItem data={item} onClick={(data) => {
                                this.state.review.sku = data.sku;
                                this.setState({});
                            }} />
                        }}
                    />
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    <LabelItem label='出库单号' value={this.state.entity.outboundNumber} />
                    <LabelItem label='联系人' value={this.state.entity.recvContact} />
                    <LabelItem label='联系电话' value={this.state.entity.recvContactNumber} />
                    <LabelItem label='地址' value={this.state.entity.recvAddressDetail} />
                    <InputSelect
                        iref={r => this.input1Ref = r}
                        text='SKU'
                        values={this.state.entity.outboundDetails.map((item: any) => ({
                            label: ProductInfoHelper.skuToProducts[item.sku]?.name,
                            value: item.sku
                        }))}
                        value={this.state.review.sku}
                        onChange={(value) => {
                            this.state.review.sku = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input2Ref?.focus();
                        }}
                    />
                    <Item style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text>{`名称: ${ProductInfoHelper.skuToProducts[this.state.review.sku]?.name || ''}`}</Text>
                        <Text>{`计量单位: ${ProductInfoHelper.skuToProducts[this.state.review.sku]?.unit || ''}`}</Text>
                        <Text>{`体积: ${ProductInfoHelper.skuToProducts[this.state.review.sku]?.volume || ''} ${ProductInfoHelper.skuToProducts[this.state.review.sku]?.volumeUnit || '--'}`}</Text>
                        <Text>{`重量: ${ProductInfoHelper.skuToProducts[this.state.review.sku]?.weight || ''} ${ProductInfoHelper.skuToProducts[this.state.review.sku]?.weightUnit || '--'}`}</Text>
                    </Item>
                    <InputNumberItem
                        iref={r => this.input2Ref = r}
                        text='复核数量'
                        value={this.state.review.quantity}
                        min={0}
                        onChange={(value) => {
                            this.state.review.quantity = value || 0;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            if (this.review()) {
                                this.input1Ref?.focus();
                            }
                        }}
                    />
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button borderRadius={0} width='100%' size='lg' onPress={this.review}>复核</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showFinish}
                            title='提示'
                            message='订单已全部复核，是否完成复核？'
                            onCancel={() => {
                                this.setState({ showFinish: false });
                            }}
                            onOk={() => {
                                this.fetchReview().then(() => {
                                    this.setState({ showFinish: false });
                                });
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
    },
});

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const location = useLocation();
    const navigate = useNavigate();

    return <SortingAction
        warehouseId={warehouseId}
        location={location}
        navigate={navigate}
    />
}