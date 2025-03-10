import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, Checkbox } from 'native-base';
import { Storage } from 'ice-common';
import DateTimePicker from '@react-native-community/datetimepicker';

import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem, Item } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';
import { areaSlice, enums, IceStateType, InboundOrderApi, ProductInfoHelper } from 'ice-core';
import EnforceOnShelfCheckBox from '../../components/EnforceOnShelfCheckBox';
import IgnoreSpecCheckBox from '../../components/IgnoreSpecCheckBox';
import LocationInput from '../../components/LocationInput';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>名称</Text>
        <Text style={styles.ListItemText2}>查验数量</Text>
        <Text style={styles.ListItemText3}>上架数量</Text>
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
        <Text style={styles.ListItemText2}>{item.actualQuantity}</Text>
        <Text style={styles.ListItemText3}>{item.shelvesQuantity}</Text>
    </TouchableOpacity>
}

type Props = {
    warehouseId: string,
    areas: Array<any>,
    fetchAreas: () => Promise<any>,
    location: any,
    navigate: (url: any) => void,
};

class OnshelfAction extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        id: this.props.location.state.inboundOrder.id,
        loading: false,
        entity: {
            inboundNumber: '',
            inboundBatch: '',
            type: enums.InboundOrderType.Purchase,
            inboundDetails: []
        } as any,
        // 上架数据
        onShelf: {
            sku: '',
            shelvesQuantity: 0,
            locationCode: '',
            // 是否强制上架
            enforce: false,
        },
        // 忽略规格检查
        ignoreSpecCheck: false,
        // 推荐上架库位
        recommendOnShelfLocation: null as ({
            minQuantityLocation: string | null,
            maxQuantityLocation: string | null,
            someShelfLiseLocation: string | null
        } | null),
        // 显示完成模态
        showFinish: false,
        // 显示强制模态
        showEnforce: false,
    }

    componentDidMount() {
        this.input1Ref?.focus();

        this.setState({ loading: true });
        Promise.all([
            this.props.fetchAreas(),
            this.fetchEntity(),
        ]).then(() => {
            return ProductInfoHelper.fetchProducts(this.state.entity.inboundDetails.map((e: any) => e.sku)).then(() => {
                this.setState({});
            });
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // 选择SKU
    skuSelect = (sku: string) => {
        let inboundDetail = this.state.entity.inboundDetails.find((e: any) => e.sku == sku);
        if (!inboundDetail) {
            Toast.show({
                title: '无效的SKU'
            });
            return;
        }

        let shelvesQuantity = inboundDetail.actualQuantity - inboundDetail.shelvesQuantity;
        this.setState({
            onShelf: {
                ...this.state.onShelf,
                sku: sku,
                shelvesQuantity: shelvesQuantity > 0 ? shelvesQuantity : 0,
                locationCode: '',
            }
        });

        Toast.show({
            title: '请输入上架数量'
        });
        this.fetchRecommendOnShelfLocation(inboundDetail.sku, inboundDetail.shelfLise);
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

        await InboundOrderApi.onShelf({
            id: this.state.id,
            "sku": this.state.onShelf.sku,
            "quantity": this.state.onShelf.shelvesQuantity,
            "locationCode": this.state.onShelf.locationCode,
            enforce: this.state.onShelf.enforce
        }).then(() => {
            Toast.show({
                title: `SKU: ${this.state.onShelf.sku}上架成功`
            });
            this.setState({
                // 上架数据
                onShelf: {
                    sku: '',
                    shelvesQuantity: 0,
                    locationCode: '',
                    enforce: this.state.onShelf.enforce
                }
            });

            return this.fetchEntity().then((val: any) => {
                let inboundDetails = val.inboundDetails;

                // 检查是否有实际数量小于预报数量
                for (let inboundDetail of inboundDetails) {
                    if (inboundDetail.shelvesQuantity < inboundDetail.actualQuantity) {
                        return;
                    }
                }

                this.setState({ showFinish: true });
            });
        });
        return true;
    }

    // 完成订单
    fetchFinishOnShelf = () => {
        return InboundOrderApi.finishOnShelf(this.state.id).then(() => {
            Toast.show({
                title: `订单${this.state.entity.inboundNumber}已完成上架`
            });
            this.fetchEntity();
            this.props.navigate(-1);
        });
    }

    // 请求实体
    fetchEntity = () => {
        return InboundOrderApi.get(this.state.id).then((val) => {
            this.setState({ entity: val });
            return val;
        });
    }

    // 请求推荐上架库位
    fetchRecommendOnShelfLocation = (sku: string, shelfLise: string,) => {
        return InboundOrderApi.getRecommendOnShelfLocation({
            warehouseId: this.props.warehouseId,
            sku: sku,
            shelfLise: shelfLise
        }).then((datas) => {
            this.setState({
                recommendOnShelfLocation: datas
            });
        });
    }

    render() {
        return <Layout
            title={`上架 - ${this.props.location.state.inboundOrder.inboundNumber}`}
        >
            <View flexGrow={1} flexShrink={1}>
                <ListHeader />
                <View h={1} flexGrow={1} flexShrink={1}>
                    <FlatList
                        data={this.state.entity.inboundDetails}
                        renderItem={(item) => {
                            return <ListItem data={item} onClick={(data) => {
                                this.skuSelect(data.sku);
                            }} />
                        }}
                    />
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    {
                        this.state.recommendOnShelfLocation &&
                        <Item>
                            <Text>推荐: </Text>
                            {
                                this.state.recommendOnShelfLocation.minQuantityLocation ?
                                    <TouchableOpacity
                                        style={{ marginRight: 10 }}
                                        onPress={() => {
                                            this.state.onShelf.locationCode = this.state.recommendOnShelfLocation!.minQuantityLocation!;
                                            this.setState({});
                                            this.input3Ref?.focus();
                                        }}
                                    ><Text>{`${this.state.recommendOnShelfLocation.minQuantityLocation} [库存最小]`}</Text></TouchableOpacity>
                                    : undefined
                            }
                            {
                                this.state.recommendOnShelfLocation.maxQuantityLocation ?
                                    <TouchableOpacity
                                        style={{ marginRight: 10 }}
                                        onPress={() => {
                                            this.state.onShelf.locationCode = this.state.recommendOnShelfLocation!.maxQuantityLocation!;
                                            this.setState({});
                                            this.input3Ref?.focus();
                                        }}
                                    ><Text>{`${this.state.recommendOnShelfLocation.maxQuantityLocation} [库存最大]`}</Text></TouchableOpacity>
                                    : undefined
                            }
                            {
                                this.state.recommendOnShelfLocation.someShelfLiseLocation ?
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.state.onShelf.locationCode = this.state.recommendOnShelfLocation!.someShelfLiseLocation!;
                                            this.setState({});
                                            this.input3Ref?.focus();
                                        }}
                                    ><Text>{`${this.state.recommendOnShelfLocation.someShelfLiseLocation} [同保质期]`}</Text></TouchableOpacity>
                                    : undefined
                            }
                        </Item>
                    }
                    <InputItem
                        iref={r => this.input1Ref = r}
                        text='SKU'
                        value={this.state.onShelf.sku}
                        onChange={(value) => {
                            this.state.onShelf.sku = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.skuSelect(this.state.onShelf.sku);
                            this.input2Ref?.focus();
                        }}
                    />
                    <InputNumberItem
                        iref={r => this.input2Ref = r}
                        text='上架数量'
                        value={this.state.onShelf.shelvesQuantity}
                        onChange={(value) => {
                            this.state.onShelf.shelvesQuantity = value || 0;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.input3Ref?.focus();
                        }}
                    />
                    <LocationInput
                        iref={r => this.input3Ref = r}
                        text='上架库位'
                        value={this.state.onShelf.locationCode}
                        onChange={(value) => {
                            this.state.onShelf.locationCode = value;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.fetchOnShelf().then((success) => {
                                if (success)
                                    this.input1Ref?.focus();
                            });
                        }}
                    />
                    <Item>
                        <EnforceOnShelfCheckBox
                            checked={this.state.onShelf.enforce}
                            onChange={(check) => {
                                this.state.onShelf.enforce = check;
                                this.setState({});
                            }}
                        />
                    </Item>
                    <Item>
                        <IgnoreSpecCheckBox
                            checked={this.state.ignoreSpecCheck}
                            onChange={val => {
                                this.state.ignoreSpecCheck = val;
                                this.setState({});
                            }}
                        />
                    </Item>
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button borderRadius={0} width='43%' size='lg' onPress={() => {
                            this.setState({ showEnforce: true });
                        }}>强制完成</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showEnforce}
                            title='提示'
                            message='是否强制完成上架'
                            onCancel={() => {
                                this.setState({ showEnforce: false });
                            }}
                            onOk={() => {
                                this.fetchFinishOnShelf().then(() => {
                                    this.setState({ showEnforce: false });
                                });
                            }}
                        />
                        <Button borderRadius={0} width='43%' size='lg' onPress={this.fetchOnShelf}>上架</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showFinish}
                            title='提示'
                            message='订单已全部上架，是否完成上架'
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
    const dispatch = useDispatch();
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];
    const fetchDatas = async () => {
        dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }
    const location = useLocation();
    const navigate = useNavigate();
    return <OnshelfAction
        warehouseId={warehouseId}
        areas={areas}
        fetchAreas={fetchDatas}
        location={location}
        navigate={navigate}
    />
}