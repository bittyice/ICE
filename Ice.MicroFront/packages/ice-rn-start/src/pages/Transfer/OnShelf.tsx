import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Button, FormControl, Modal, Toast, View, Checkbox, HStack, Text } from 'native-base';
import { LabelItem, Item, InputItem, InputNumberItem } from '../../components/Item';
import EnforceOnShelfCheckBox from '../../components/EnforceOnShelfCheckBox';
import IgnoreSpecCheckBox from '../../components/IgnoreSpecCheckBox';
import LocationInput from '../../components/LocationInput';
import { iceFetch, Tool } from 'ice-common';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { IceStateType, ProductInfoHelper, TransferSkuApi, areaSlice } from 'ice-core';

const SelectSkuModal = (props: {
    visible: boolean,
    onCancel: () => void,
    onOk: (transferSkuId: string) => void,
    transferSkus: Array<any>
}) => {
    const [selectId, setSelectId] = useState(null);

    function onOk() {
        if (!selectId) {
            Toast.show({
                title: '请选择SKU'
            })
            return;
        }

        props.onOk(selectId);
    }

    return <Modal
        isOpen={props.visible}
        onClose={props.onCancel}
    >
        <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>选择SKU</Modal.Header>
            <Modal.Body>
                {
                    props.transferSkus.map(item => (
                        <TouchableOpacity
                            style={[styles.SelectSkuItem, item.id == selectId ? styles.SelectSkuItemSelected : undefined]}
                            onPress={() => {
                                setSelectId(item.id);
                            }}
                        >
                            <View mb={1} style={{ flexDirection: 'row' }}>
                                <Text>SKU: {item.sku}</Text>
                                <Text ml={2}>数量: {item.quantity}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text>入库批次号: {item.inboundBatch}</Text>
                                <Text ml={2}>过期时间: {Tool.dateFormat(item.shelfLise, 'yyyy-MM-dd')}</Text>
                            </View>
                        </TouchableOpacity>))
                }
            </Modal.Body>
            <Modal.Footer>
                <Button.Group space={2}>
                    <Button variant="ghost" colorScheme="blueGray" onPress={props.onCancel}>
                        取消
                    </Button>
                    <Button onPress={onOk}>
                        确定
                    </Button>
                </Button.Group>
            </Modal.Footer>
        </Modal.Content>
    </Modal>
}

type Props = {
    warehouseId: string,
    areas: Array<any>,
    fetchAreas: () => Promise<any>,
};

class Page extends React.Component<Props> {
    input1Ref: any;
    input2Ref: any;
    input3Ref: any;

    state = {
        loading: false,
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
        transferSkus: [] as Array<any>,
        showSelectSku: false,
    }

    componentDidMount() {
        this.input1Ref?.focus();

        this.setState({ loading: true });
        this.props.fetchAreas().finally(() => {
            this.setState({ loading: false });
        });
    }

    // 上架
    onShelf = async () => {
        if (this.state.loading == true) {
            return false;
        }

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

        // 请求 transferSkuId
        await TransferSkuApi.findTransferSkus({
            warehouseId: this.props.warehouseId,
            sku: this.state.onShelf.sku,
        }).then((datas: Array<any>) => {
            if (datas.length == 0) {
                Toast.show({
                    title: '无效的SKU'
                });
                return;
            }

            if (datas.length == 1) {
                this.fetchOnShelf(datas[0].id);
                return;
            }

            this.setState({
                transferSkus: datas,
                showSelectSku: true,
            });
        });
        return true;
    }

    fetchOnShelf = (transferSkuId: string) => {
        this.setState({ loading: true });
        return TransferSkuApi.onShelf({
            transferSkuId: transferSkuId,
            quantity: this.state.onShelf.shelvesQuantity,
            locationCode: this.state.onShelf.locationCode,
            enforce: this.state.onShelf.enforce,
            warehouseId: this.props.warehouseId,
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
        }).finally(() => {
            this.setState({ loading: false });
        });
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

        return <View flexGrow={1} flexShrink={1}>
            <View h={1} flexGrow={1} flexShrink={1}>
            </View>
            <View mt={5} flexGrow={0} flexShrink={0}>
                <InputItem
                    iref={r => this.input1Ref = r}
                    text='SKU'
                    value={this.state.onShelf.sku}
                    onChange={(value) => {
                        this.state.onShelf.sku = value;
                        this.setState({});
                    }}
                    onSubmitEditing={() => {
                        this.input2Ref?.focus();
                        this.fetchProductInfo();
                    }}
                    onBlur={() => {
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
                        this.onShelf();
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
                    <Button isLoading={this.state.loading} borderRadius={0} width='100%' size='lg' onPress={this.onShelf}>上架</Button>
                </HStack>
            </View>
            <SelectSkuModal
                visible={this.state.showSelectSku}
                onCancel={() => {
                    this.setState({ showSelectSku: false });
                }}
                onOk={(transferSkuId) => {
                    this.fetchOnShelf(transferSkuId);
                    this.setState({ showSelectSku: false });
                }}
                transferSkus={this.state.transferSkus}
            />
        </View>
    }
}

const styles = StyleSheet.create({
    SelectSkuItem: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'solid',
        marginBottom: 10,
        padding: 8
    },
    SelectSkuItemSelected: {
        borderColor: '#1890ff'
    }
});

export default () => {
    const dispatch = useDispatch();
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    const areas = useSelector((state: IceStateType) => state.area.allDatas) || [];
    const fetchDatas = async () => {
        dispatch(areaSlice.asyncActions.fetchAllDatas({}) as any);
    }
    return <Page
        warehouseId={warehouseId}
        areas={areas}
        fetchAreas={fetchDatas}
    />
}
