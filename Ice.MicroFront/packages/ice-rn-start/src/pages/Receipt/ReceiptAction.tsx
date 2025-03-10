import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, } from 'native-base';
import { InboundOrderApi, LabelValues, ProductInfoHelper } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';

import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>SKU</Text>
        <Text style={styles.ListItemText2}>产品名</Text>
        <Text style={styles.ListItemText3}>预报数量</Text>
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
        <Text style={styles.ListItemText2}>{ProductInfoHelper.skuToProducts[item.sku]?.name}</Text>
        <Text style={styles.ListItemText3}>{item.forecastQuantity}</Text>
    </TouchableOpacity>
}

class Receipt extends React.Component<{
    location: any,
    navigate: (url: any) => void,
}> {
    inputRef1: TextInput | undefined;
    inputRef2: TextInput | undefined;

    state = {
        id: this.props.location.state.inboundOrder.id,
        // 入库订单
        entity: {
            inboundDetails: []
        } as any,
        // 确认收货模态
        showComfirmReceipt: false,
    }

    componentDidMount() {
        this.fetchDatas().then(() => {
            return ProductInfoHelper.fetchProducts(this.state.entity.inboundDetails.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        });
    }

    fetchDatas = () => {
        return InboundOrderApi.get(this.state.id).then((data) => {
            this.setState({ entity: data });
            return data;
        }).catch(() => {
        });
    }

    // 收货
    fetchReceipt = () => {
        return InboundOrderApi.receipt(this.state.entity.id).then(() => {
            Toast.show({
                title: '收货成功'
            });
            this.props.navigate(-1);
        });
    }

    render() {
        return <Layout
            title='收货'
        >
            <View flexGrow={1} flexShrink={1}>
                <ListHeader />
                <View h={1} flexGrow={1} flexShrink={1}>
                    <FlatList
                        data={this.state.entity.inboundDetails}
                        renderItem={(item) => {
                            return <ListItem data={item} onClick={() => { }} />
                        }}
                    />
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    <LabelItem label='入库单号' value={this.state.entity?.inboundNumber} />
                    <LabelItem label='入库批次' value={this.state.entity?.inboundBatch} />
                    <LabelItem label='入库类型' value={LabelValues.InboundOrderType.find(e => e.value == this.state.entity?.type)?.label as string} />
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button disabled={!this.state.entity} borderRadius={0} width='100%' size='lg' onPress={() => {
                            this.setState({ showComfirmReceipt: true });
                        }}>确认收货</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showComfirmReceipt}
                            title='提示'
                            message='是否确认收货？'
                            onCancel={() => {
                                this.setState({ showComfirmReceipt: false });
                            }}
                            onOk={this.fetchReceipt}
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
    const location = useLocation();
    const navigate = useNavigate();

    return <Receipt
        location={location}
        navigate={navigate}
    />
}
