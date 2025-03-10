import React from 'react';
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, ChevronRightIcon } from 'native-base';
import Layout from '../../components/Layout';
import SelectEX from '../../components/SelectEX';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import MenuProvider from '../../MenuProvider';
import { LabelValues, OutboundOrderApi, enums } from 'ice-core';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>订单号</Text>
        <Text style={styles.ListItemText2}>联系人</Text>
        <Text style={styles.ListItemText3}>类型</Text>
        <Text style={styles.ListItemText4}></Text>
    </View>
}

const ListItem = (props: { data: any }) => {
    let { item, index } = props.data;
    const nav = useNavigate();

    return <TouchableOpacity style={styles.ListItem}
        onPress={() => {
            nav(MenuProvider.getUrl(['review-action']), {
                state: {
                    outboundOrder: item
                }
            });
        }}
    >
        <Text style={styles.ListItemText1}>{item.outboundNumber}</Text>
        <Text style={styles.ListItemText2}>{item.recvContact}</Text>
        <Text style={styles.ListItemText3}>{LabelValues.OutboundOrderType.find(e => e.value == item.orderType)?.label}</Text>
        <ChevronRightIcon style={styles.ListItemText4} w={5} size='sm' />
    </TouchableOpacity>
}

class Review extends React.Component<{
}> {
    inputRef1: TextInput | null = null;

    state = {
        outboundNumber: '',
        // 订单列表
        orders: [] as Array<any>,
    }

    componentDidMount(): void {
        this.fetchList();
    }

    fetchList = () => {
        return OutboundOrderApi.getList(
            1,
            50,
            {
                outboundNumber: this.state.outboundNumber,
                status: enums.OutboundOrderStatus.TobeOut,
                reviewed: false,
            },
            'creationTime',
            'descend'
        ).then((datas) => {
            this.setState({ orders: datas.datas });
        });
    }

    render() {
        return <Layout
            title='复核'
        >
            <View flex={1}>
                <View bg='#fff' mt={3} pl={3} pr={3}>
                    <Input
                        ref={(r: any) => this.inputRef1 = r}
                        variant='unstyled'
                        InputLeftElement={<Text ml={5} mr={5}>出库单号</Text>}
                        InputRightElement={<Button w='20' variant='unstyled' onPress={this.fetchList}>搜索</Button>}
                        value={this.state.outboundNumber}
                        onChangeText={(value) => {
                            this.setState({ outboundNumber: value });
                        }}
                        onSubmitEditing={this.fetchList}
                    />
                </View>
                <ListHeader />
                <View h={1} flexGrow={1}>
                    <FlatList
                        data={this.state.orders}
                        renderItem={(item) => {
                            return <ListItem data={item} />
                        }}
                    />
                </View>
            </View>
        </Layout>
    }
}

export default Review;

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
        width: '22%'
    },
    ListItemText3: {
        width: '22%'
    },
    ListItemText4: {
        width: '6%'
    }
});