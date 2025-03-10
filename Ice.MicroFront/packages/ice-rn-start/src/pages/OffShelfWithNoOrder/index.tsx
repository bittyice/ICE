import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, Radio, theme, Stack } from 'native-base';
import { Storage, iceFetch } from 'ice-common';
import DateTimePicker from '@react-native-community/datetimepicker';

import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem, Item } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';
import LocationInput from '../../components/LocationInput';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { IceStateType, ProductInfoApi } from 'ice-core';

type Props = {
    warehouseId: string,
};

type OffShelfType = {
    sku: string,
    quantity: number,
    locationCode: string,
}

class OnshelfAction extends React.Component<Props> {
    layoutRef: Layout | null = null;
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        loading: false,
        offShelfedList: [] as Array<OffShelfType>,
        // 下架数据
        offShelf: {
            sku: '',
            quantity: 0,
            locationCode: '',
        } as OffShelfType,
        // 当前SKU信息
        productInfo: {} as any
    }

    componentDidMount() {
        this.input1Ref?.focus();
    }

    // 上架
    fetchOffShelf = () => {
        if (!this.state.offShelf.sku) {
            Toast.show({
                title: '请输入SKU'
            });
            return false;
        }

        if (!this.state.offShelf.quantity) {
            Toast.show({
                title: '请输入下架数量'
            });
            return false;
        }

        if (!this.state.offShelf.locationCode) {
            Toast.show({
                title: '请输入下架库位'
            });
            return false;
        }

        this.setState({ loading: true });
        return iceFetch(`/api/wms/on-off-shelf/off-shelf-with-no-order`, {
            method: 'PUT',
            body: JSON.stringify({
                warehouseId: this.props.warehouseId,
                "sku": this.state.offShelf.sku,
                "quantity": this.state.offShelf.quantity,
                "locationCode": this.state.offShelf.locationCode,
            })
        }).then(() => {
            Toast.show({
                title: `SKU: ${this.state.offShelf.sku}下架成功`
            });
            let offShelfedList = [
                ...this.state.offShelfedList,
                {
                    ...this.state.offShelf
                }
            ];

            this.setState({
                // 下架数据
                offShelf: {
                    ...this.state.offShelf,
                    sku: '',
                    quantity: 0,
                },
                offShelfedList: offShelfedList
            });
            this.input2Ref?.focus();
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 请求产品信息
    fetchProductInfo = () => {
        return ProductInfoApi.getForSkus({
            skus: [this.state.offShelf.sku]
        }).then(datas => {
            let product = datas[0];
            if (product) {
                this.setState({ productInfo: product });
            }
            else {
                Toast.show({
                    title: '无效的SKU'
                });
            }
        });
    }

    render() {
        return <Layout
            ref={r => this.layoutRef = r}
            title='无单下架'
        >
            <View flexGrow={1} flexShrink={1}>
                <View h={1} flexGrow={1} flexShrink={1}>
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    <LocationInput
                        iref={r => this.input1Ref = r}
                        text='下架库位'
                        value={this.state.offShelf.locationCode}
                        onChange={(value) => {
                            this.state.offShelf.locationCode = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input2Ref?.focus();
                        }}
                    />
                    <InputItem
                        iref={r => this.input2Ref = r}
                        text='SKU'
                        value={this.state.offShelf.sku}
                        onChange={(value) => {
                            this.state.offShelf.sku = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input3Ref?.focus();
                            this.fetchProductInfo();
                        }}
                    />
                    <Item style={{ justifyContent: 'space-between' }}>
                        <Stack direction='row' flexWrap='wrap' space={4}>
                            <Text>{`SKU: ${this.state.productInfo.sku || ''}`}</Text>
                            <Text>{`名称: ${this.state.productInfo.name || ''}`}</Text>
                            <Text>{`规格: ${this.state.productInfo.specification || ''}`}</Text>
                        </Stack>
                    </Item>
                    <Item style={{ justifyContent: 'space-between' }}>
                        <Stack direction='row' flexWrap='wrap' space={4}>
                            <Text>{`体积: ${this.state.productInfo.volume || 0} ${this.state.productInfo.volumeUnit || ''}`}</Text>
                            <Text>{`重量: ${this.state.productInfo.weight || 0} ${this.state.productInfo.weightUnit || ''}`}</Text>
                        </Stack>
                    </Item>
                    <InputNumberItem
                        iref={r => this.input3Ref = r}
                        text='下架数量'
                        value={this.state.offShelf.quantity}
                        onChange={(value) => {
                            this.state.offShelf.quantity = value || 0;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.fetchOffShelf();
                        }}
                    />
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button borderRadius={0} width='100%' size='lg' onPress={this.fetchOffShelf}>下架</Button>
                    </HStack>
                </View>
            </View>
        </Layout >
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

    return <OnshelfAction
        warehouseId={warehouseId}
    />
}