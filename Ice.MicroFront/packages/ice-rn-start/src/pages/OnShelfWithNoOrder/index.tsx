import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Checkbox, FlatList, Toast, Stack, } from 'native-base';
import { Storage, Tool, iceFetch } from 'ice-common';
import DateTimePicker from '@react-native-community/datetimepicker';

import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem, Item } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';
import EnforceOnShelfCheckBox from '../../components/EnforceOnShelfCheckBox';
import IgnoreSpecCheckBox from '../../components/IgnoreSpecCheckBox';
import LocationInput from '../../components/LocationInput';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { IceStateType, ProductInfoHelper, areaSlice } from 'ice-core';

type OnShelfType = {
    sku: string,
    shelvesQuantity: number,
    locationCode: string,
    inboundBatch: string,
    shelfLise: null | Date,
    // 是否强制上架
    enforce: boolean,
}

type Props = {
    warehouseId: string,
    areas: Array<any>,
    fetchAreas: () => Promise<any>
};

class OnShelfWithNoOrder extends React.Component<Props> {
    layoutRef: Layout | null = null;
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        loading: false,
        onShelfedList: [] as Array<OnShelfType>,
        // 上架数据
        onShelf: {
            sku: '',
            shelvesQuantity: 0,
            locationCode: '',
            inboundBatch: '',
            shelfLise: null,
            // 是否强制上架
            enforce: false,
        } as OnShelfType,
        showDate: false,
        ignoreSpecCheck: false,
    }

    componentDidMount() {
        this.setState({ loading: true });
        this.props.fetchAreas().finally(() => {
            this.setState({ loading: false });
        });
    }

    // 自动生成入库批次号
    createInboundBatchClick = () => {
        let timestr = Tool.dateFormat(new Date(), 'yyMMdd');
        this.state.onShelf.inboundBatch = timestr!;
        this.setState({});
    }

    // 上架
    fetchOnShelf = async () => {
        if (!this.state.onShelf.sku) {
            Toast.show({
                title: '请输入SKU'
            });
            return false;
        }

        if (!this.state.onShelf.shelvesQuantity) {
            Toast.show({
                title: '请输入上架数量'
            });
            return false;
        }

        if (!this.state.onShelf.locationCode) {
            Toast.show({
                title: '请输入上架库位'
            });
            return false;
        }

        // 判断SKU的规格是否允许上架到库区
        if (this.state.ignoreSpecCheck == false) {
            // 查找对应的库区
            let area = this.props.areas.find(area => this.state.onShelf.locationCode.startsWith(area.code));
            // 进行规格检查
            let result = await ProductInfoHelper.specCheck(this.state.onShelf.sku, area.allowSpecifications, area.forbidSpecifications);
            if (result.allow == false) {
                Toast.show({
                    title: `SKU: ${this.state.onShelf.sku}, 规格: ${result.allowSpec || result.forbidSpec} 不能上架到库区 ${area.code}`
                });
                return false;
            }
        }

        let shelfLise;
        if (this.state.onShelf.shelfLise) {
            shelfLise = Tool.dateFormat(this.state.onShelf.shelfLise, 'yyyy-MM-ddT00:00:00.000Z');
        }

        await ProductInfoHelper.fetchProducts([this.state.onShelf.sku]);
        let curProduct = ProductInfoHelper.skuToProducts[this.state.onShelf.sku];

        this.setState({ loading: true });
        await iceFetch(`/api/wms/on-off-shelf/on-shelf-with-no-order`, {
            method: 'PUT',
            body: JSON.stringify({
                warehouseId: this.props.warehouseId,
                sku: this.state.onShelf.sku,
                quantity: this.state.onShelf.shelvesQuantity,
                locationCode: this.state.onShelf.locationCode,
                inboundBatch: this.state.onShelf.inboundBatch,
                shelfLise: shelfLise,
                enforce: this.state.onShelf.enforce,
                ownerId: curProduct?.groupId,
            })
        }).then(() => {
            Toast.show({
                title: `SKU: ${this.state.onShelf.sku}上架成功`
            });
            let onShelfedList = [
                ...this.state.onShelfedList,
                {
                    ...this.state.onShelf
                }
            ];

            this.setState({
                // 上架数据
                onShelf: {
                    ...this.state.onShelf,
                    sku: '',
                    shelvesQuantity: 0,
                },
                onShelfedList: onShelfedList
            });
            this.input2Ref?.focus();
        }).finally(() => {
            this.setState({ loading: false });
        });
        return true;
    }

    // 请求产品信息
    fetchProductInfo = () => {
        this.setState({ loading: true });
        ProductInfoHelper.fetchProducts([this.state.onShelf.sku]).finally(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        let productInfo = ProductInfoHelper.skuToProducts[this.state.onShelf.sku] || {};

        return <Layout
            ref={r => this.layoutRef = r}
            title='无单上架'
        >
            <View flexGrow={1} flexShrink={1}>
                <View h={1} flexGrow={1} flexShrink={1}>
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    <LocationInput
                        iref={r => this.input1Ref = r}
                        text='上架库位'
                        value={this.state.onShelf.locationCode}
                        onChange={(value) => {
                            this.state.onShelf.locationCode = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input2Ref?.focus();
                        }}
                    />
                    <Item style={{ justifyContent: 'flex-end' }}>
                        <EnforceOnShelfCheckBox
                            checked={this.state.onShelf.enforce}
                            onChange={(check) => {
                                this.state.onShelf.enforce = check;
                                this.setState({});
                            }}
                        />
                    </Item>
                    <Item style={{ justifyContent: 'flex-end' }}>
                        <IgnoreSpecCheckBox
                            checked={this.state.ignoreSpecCheck}
                            onChange={val => {
                                this.state.ignoreSpecCheck = val;
                                this.setState({});
                            }}
                        />
                    </Item>
                    <InputItem
                        iref={r => this.input2Ref = r}
                        text='SKU'
                        value={this.state.onShelf.sku}
                        onChange={(value) => {
                            this.state.onShelf.sku = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input3Ref?.focus();
                            this.fetchProductInfo();
                        }}
                    />
                    <Item style={{ justifyContent: 'space-between' }}>
                        <Stack direction='row' flexWrap='wrap' space={4}>
                            <Text>{`SKU: ${productInfo.sku || ''}`}</Text>
                            <Text>{`名称: ${productInfo.name || ''}`}</Text>
                            <Text>{`规格: ${productInfo.specification || ''}`}</Text>
                        </Stack>
                    </Item>
                    <Item style={{ justifyContent: 'space-between' }}>
                        <Stack direction='row' flexWrap='wrap' space={4}>
                            <Text>{`体积: ${productInfo.volume || 0} ${productInfo.volumeUnit || ''}`}</Text>
                            <Text>{`重量: ${productInfo.weight || 0} ${productInfo.weightUnit || ''}`}</Text>
                        </Stack>
                    </Item>
                    <InputNumberItem
                        iref={r => this.input3Ref = r}
                        text='上架数量'
                        value={this.state.onShelf.shelvesQuantity}
                        onChange={(value) => {
                            this.state.onShelf.shelvesQuantity = value || 0;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.fetchOnShelf();
                        }}
                    />
                    <InputItem
                        text='批次号'
                        value={this.state.onShelf.inboundBatch}
                        onChange={(value) => {
                            this.state.onShelf.inboundBatch = value;
                            this.setState({});
                        }}
                    />
                    <Item style={{ justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={this.createInboundBatchClick}><Text>生成批次号</Text></TouchableOpacity>
                    </Item>
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
                            <Text style={{ marginLeft: 16 }}>{Tool.dateFormat(this.state.onShelf.shelfLise, 'yyyy-MM-dd')}</Text>
                        </TouchableOpacity>
                        <View style={{ flexGrow: 1 }}></View>
                        <TouchableOpacity
                            onPress={() => {
                                this.state.onShelf.shelfLise = null;
                                this.setState({});
                            }}
                        >
                            <Text>清空</Text>
                        </TouchableOpacity>
                    </Item>
                    {this.state.showDate && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={this.state.onShelf.shelfLise ? new Date(this.state.onShelf.shelfLise) : new Date()}
                            mode='date'
                            is24Hour={true}
                            onChange={(event, selectedDate) => {
                                this.state.onShelf.shelfLise = selectedDate || null;
                                this.setState({
                                    showDate: false
                                });
                            }}
                        />
                    )}
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button borderRadius={0} width='100%' size='lg' onPress={this.fetchOnShelf}>上架</Button>
                    </HStack>
                </View>
            </View>
        </Layout>
    }
}

export default () => {
    const dispatch = useDispatch();
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];
    const fetchDatas = async () => {
        dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }
    return <OnShelfWithNoOrder
        warehouseId={warehouseId}
        areas={areas}
        fetchAreas={fetchDatas}
    />
}
