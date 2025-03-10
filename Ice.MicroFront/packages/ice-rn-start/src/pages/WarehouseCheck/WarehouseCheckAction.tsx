import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Checkbox, FlatList, Toast, Stack, } from 'native-base';
import { Storage, Tool } from 'ice-common';
import DateTimePicker from '@react-native-community/datetimepicker';
import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem, Item } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';
import LocationInput from '../../components/LocationInput';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { IceStateType, LocationDetailApi, ProductInfoHelper, WarehouseCheckApi } from 'ice-core';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>库位</Text>
        <Text style={styles.ListItemText2}>SKU</Text>
        <Text style={styles.ListItemText3}>数量</Text>
    </View>
}

const ListItem = (props: { data: any, onClick: (data: any) => void }) => {
    let { item, index } = props.data;

    return <TouchableOpacity style={styles.ListItem}
        onPress={() => {
            props.onClick(item);
        }}
    >
        <Text style={styles.ListItemText1}>{item.locationCode}</Text>
        <Text style={styles.ListItemText2}>{item.sku}</Text>
        <Text style={styles.ListItemText3}>{item.quantity}</Text>
    </TouchableOpacity>
}

type Props = {
    warehouseId: string,
    location: any,
    navigate: (url: any) => void,
};

class OnShelfWithNoOrder extends React.Component<Props> {
    layoutRef: Layout | null = null;
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        id: this.props.location.state.warehouseCheck.id,
        loading: false,
        // 历史记录
        historyDatas: [],
        // 保存查询的库存数据
        inquire: null as any,
        // 盘点数据
        check: {
            sku: '',
            quantity: null as (number | null),
            locationCode: '',
            shelfLise: null as (Date | null),
            inboundBatch: ''
        },
        showDate: false
    }

    // 盘点
    fetchCheck = async () => {
        if (this.state.loading) {
            return false;
        }

        if (!this.state.check.sku) {
            Toast.show({
                title: '请输入SKU'
            });
            return false;
        }

        if (this.state.check.quantity != 0 && !this.state.check.quantity) {
            Toast.show({
                title: '请输入盘点数量'
            });
            return false;
        }

        if (!this.state.check.locationCode) {
            Toast.show({
                title: '请输入盘点库位'
            });
            return false;
        }

        // 这里做一个判断，如果未发生更改则不调用后端接口
        if (
            this.state.check.sku == this.state.inquire?.sku &&
            this.state.check.quantity == this.state.inquire?.quantity &&
            this.state.check.locationCode == this.state.inquire?.locationCode &&
            this.state.check.shelfLise == this.state.inquire?.shelfLise &&
            this.state.check.inboundBatch == this.state.inquire?.inboundBatch
        ) {
            this.checkSuccess();
            return false;
        }

        let shelfLise;
        if (this.state.check.shelfLise) {
            shelfLise = Tool.dateFormat(this.state.check.shelfLise, 'yyyy-MM-ddT00:00:00.000Z');
        }

        await ProductInfoHelper.fetchProducts([this.state.check.sku]);
        let curProduct = ProductInfoHelper.skuToProducts[this.state.check.sku];

        this.setState({ loading: true });
        await WarehouseCheckApi.check({
            warehouseId: this.props.warehouseId,
            sku: this.state.check.sku,
            quantity: this.state.check.quantity,
            locationCode: this.state.check.locationCode,
            shelfLise: shelfLise || undefined,
            inboundBatch: this.state.check.inboundBatch,
            warehouseCheckId: this.state.id,
        }).then(() => {
            return this.checkSuccess();
        }).finally(() => {
            this.setState({ loading: false });
        });
        return true;
    }

    // 盘点成功操作
    checkSuccess() {
        Toast.show({
            title: `SKU: ${this.state.check.sku}盘点成功`
        });
        this.setState({
            inquire: null,
            historyDatas: [
                ...this.state.historyDatas,
                { ...this.state.check }
            ],
            // 上架数据
            check: {
                sku: '',
                quantity: null,
                locationCode: this.state.check.locationCode,
                shelfLise: null,
                inboundBatch: ''
            }
        });
    }

    // 请求库存信息
    fetchLocationSku() {
        this.setState({ loading: true });
        return LocationDetailApi.getLocationDetailForSku({
            locationCode: this.state.check.locationCode,
            sku: this.state.check.sku,
            warehouseId: this.props.warehouseId,
        }).then((val) => {
            if (!val) {
                this.setState({
                    inquire: null
                });
                return;
            }
            let check = {
                sku: this.state.check.sku,
                locationCode: this.state.check.locationCode,
                quantity: val.quantity,
                shelfLise: val.shelfLise ? new Date(val.shelfLise) : null,
                inboundBatch: val.inboundBatch,
            };
            this.setState({
                // 上架数据
                check: check,
                inquire: {
                    ...check,
                },
            });
        }).catch(() => {
            this.setState({
                inquire: null
            });
        }).finally(() => {
            this.setState({ loading: false });
            this.input3Ref?.focus();
        });
    }

    render() {
        return <Layout
            ref={r => this.layoutRef = r}
            title='库存盘点'
        >
            <View flexGrow={1} flexShrink={1}>
                <ListHeader />
                <View h={1} flexGrow={1} flexShrink={1}>
                    <FlatList
                        data={this.state.historyDatas}
                        renderItem={(item) => {
                            return <ListItem data={item} onClick={(data) => { }} />
                        }}
                    />
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    <LocationInput
                        iref={r => this.input1Ref = r}
                        text='盘点库位'
                        value={this.state.check.locationCode}
                        onChange={(value) => {
                            this.state.check.locationCode = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input2Ref?.focus();
                        }}
                    />
                    <InputItem
                        iref={r => this.input2Ref = r}
                        text='SKU'
                        value={this.state.check.sku}
                        onChange={(value) => {
                            this.state.check.sku = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input3Ref?.focus();
                            this.fetchLocationSku();
                        }}
                    />
                    <InputNumberItem
                        iref={r => this.input3Ref = r}
                        text='盘点数量'
                        value={this.state.check.quantity}
                        onChange={(value) => {
                            this.state.check.quantity = value || 0;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.fetchCheck().then((success) => {
                                if (success)
                                    this.input2Ref?.focus();
                            });
                        }}
                    />
                    <InputItem
                        text='批次号'
                        value={this.state.check.inboundBatch}
                        onChange={(value) => {
                            this.state.check.inboundBatch = value;
                            this.setState({});
                        }}
                    />
                    <Item>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row'
                            }}
                            onPress={() => {
                                this.setState({ showDate: true });
                            }}
                        >
                            <Text>保质期</Text>
                            <Text style={{ marginLeft: 16 }}>{Tool.dateFormat(this.state.check.shelfLise, 'yyyy-MM-dd')}</Text>
                        </TouchableOpacity>
                        <View style={{ flexGrow: 1 }}></View>
                        <TouchableOpacity
                            onPress={() => {
                                this.state.check.shelfLise = null;
                                this.setState({});
                            }}
                        >
                            <Text>清空</Text>
                        </TouchableOpacity>
                    </Item>
                    {this.state.showDate && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={this.state.check.shelfLise ? new Date(this.state.check.shelfLise) : new Date()}
                            mode='date'
                            is24Hour={true}
                            onChange={(event, selectedDate) => {
                                this.state.check.shelfLise = selectedDate || null;
                                this.setState({
                                    showDate: false
                                });
                            }}
                        />
                    )}
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button borderRadius={0} width='100%' size='lg' onPress={this.fetchCheck}>提交改变</Button>
                    </HStack>
                </View>
            </View>
        </Layout>
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const location = useLocation();
    const navigate = useNavigate();

    return <OnShelfWithNoOrder
        warehouseId={warehouseId}
        location={location}
        navigate={navigate}
    />
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
        width: '25%'
    },
    ListItemText2: {
        width: '50%'
    },
    ListItemText3: {
        width: '25%'
    },
});