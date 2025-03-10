import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';
import { Button, FormControl, Modal, Toast, View, Checkbox, HStack, Stack } from 'native-base';
import { LabelItem, Item, InputItem, InputNumberItem } from '../../components/Item';
import LocationInput from '../../components/LocationInput';
import { iceFetch } from 'ice-common';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { IceStateType, ProductInfoHelper, TransferSkuApi } from 'ice-core';

type Props = {
    warehouseId: string,
};

type OffShelfType = {
    sku: string,
    quantity: number,
    locationCode: string,
}

class Page extends React.Component<Props> {
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
    }

    componentDidMount() {
        this.input1Ref?.focus();
    }

    // 上架
    fetchOffShelf = () => {
        if (this.state.loading == true) {
            return;
        }

        if (!this.state.offShelf.sku) {
            Toast.show({
                title: '请输入SKU'
            });
            return;
        }

        if (!this.state.offShelf.quantity) {
            Toast.show({
                title: '请输入下架数量'
            });
            return;
        }

        if (!this.state.offShelf.locationCode) {
            Toast.show({
                title: '请输入下架库位'
            });
            return;
        }

        this.setState({ loading: true });
        return TransferSkuApi.offShelf({
            warehouseId: this.props.warehouseId,
            "sku": this.state.offShelf.sku,
            "quantity": this.state.offShelf.quantity,
            "locationCode": this.state.offShelf.locationCode,
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
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 请求产品信息
    fetchProductInfo = () => {
        this.setState({ loading: true });
        ProductInfoHelper.fetchProducts([this.state.offShelf.sku]).finally(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        let productInfo = ProductInfoHelper.skuToProducts[this.state.offShelf.sku] || {};
        return <View flexGrow={1} flexShrink={1}>
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
                <Item style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Text>{`名称: ${productInfo.name || ''}`}</Text>
                    <Text>{`计量单位: ${productInfo.unit || ''}`}</Text>
                    <Text>{`体积: ${productInfo.volume || ''} ${productInfo.volumeUnit || '--'}`}</Text>
                    <Text>{`重量: ${productInfo.weight || ''} ${productInfo.weightUnit || '--'}`}</Text>
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
                        this.fetchOffShelf()?.then(() => {
                            this.input2Ref?.focus();
                        });
                    }}
                />
                <HStack justifyContent='space-around' mt={5} mb={5}>
                    <Button isLoading={this.state.loading} borderRadius={0} width='100%' size='lg' onPress={this.fetchOffShelf}>下架</Button>
                </HStack>
            </View>
        </View>
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    return <Page warehouseId={warehouseId} />
}