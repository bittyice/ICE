import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';

import Layout from '../../components/Layout';
import { InputItem, InputNumberItem, LabelItem, Item } from '../../components/Item';
import { ConfirmDialogModel } from '../../components/ConfirmDialog';
import { InboundOrderApi, InboundOrderEntity, ProductInfoHelper, enums } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { Tool } from 'ice-common';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>名称</Text>
        <Text style={styles.ListItemText2}>预报数量</Text>
        <Text style={styles.ListItemText3}>查验数量</Text>
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
        <Text style={styles.ListItemText2}>{item.forecastQuantity}</Text>
        <Text style={styles.ListItemText3}>{item.actualQuantity}</Text>
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
        loading: false,
        entity: {
            inboundNumber: '',
            inboundBatch: '',
            type: enums.InboundOrderType.Purchase,
            inboundDetails: []
        } as any,
        // 查验Sku
        checkSku: '',
        // 查验明细
        checkDetail: {
            sku: '',
            name: '',
            forecastQuantity: 0,
            actualQuantity: 0,
            shelfLise: null as string | null,
            remark: null as string | null,
        },
        // 显示完成模态
        showFinish: false,
        // 显示强制模态
        showEnforce: false,
        // 显示日期模态
        showDate: false,
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

    findOrderDetail = () => {
        let inboundDetail = this.state.entity.inboundDetails.find((e: any) => e.sku == this.state.checkSku);
        if (!inboundDetail) {
            Toast.show({
                title: '无效的SKU'
            });
            return;
        }

        this.setState({
            checkDetail: {
                ...inboundDetail,
                actualQuantity: inboundDetail.forecastQuantity
            }
        });
        Toast.show({
            title: '请检查各项明细是否正确'
        });
    }

    fetchCheck = async () => {
        if (!this.state.checkDetail.sku) {
            Toast.show({
                title: '请先查找SKU'
            });
            return false;
        }

        if (!this.state.checkDetail.actualQuantity) {
            Toast.show({
                title: '请输入实际数量'
            });
            return false;
        }

        let shelfLise;
        if (this.state.checkDetail.shelfLise) {
            shelfLise = Tool.dateFormat(this.state.checkDetail.shelfLise, 'yyyy-MM-ddT00:00:00.000Z')
        }

        await InboundOrderApi.check({
            id: this.state.id,
            sku: this.state.checkDetail.sku,
            forecastQuantity: this.state.checkDetail.forecastQuantity,
            actualQuantity: this.state.checkDetail.actualQuantity,
            remark: this.state.checkDetail.remark,
            shelfLise: shelfLise || undefined
        }).then(() => {
            Toast.show({
                title: `SKU: ${this.state.checkDetail.sku}查验成功`
            });
            this.setState({
                // 查验Sku
                checkSku: '',
                // 查验明细
                checkDetail: {
                    sku: '',
                    forecastQuantity: 0,
                    actualQuantity: 0,
                    shelfLise: null,
                    remark: null
                }
            });

            return this.fetchDatas().then((val: any) => {
                let inboundDetails = val.inboundDetails;

                // 检查是否有实际数量小于预报数量
                for (let inboundDetail of inboundDetails) {
                    if (inboundDetail.actualQuantity < inboundDetail.forecastQuantity) {
                        return;
                    }
                }

                this.setState({ showFinish: true });
            });
        });
        return true;
    }

    fetchToOnShelf = () => {
        return InboundOrderApi.toOnShelf(this.state.id).then(() => {
            Toast.show({
                title: `订单${this.state.entity.inboundNumber}已完成查验`
            });
            this.props.navigate(-1);
        });
    }

    render() {
        return <Layout
            title={`验货 - ${this.props.location.state.inboundOrder.inboundNumber}`}
        >
            <View flexGrow={1} flexShrink={1}>
                <ListHeader />
                <View h={1} flexGrow={1} flexShrink={1}>
                    <FlatList
                        data={this.state.entity.inboundDetails}
                        renderItem={(item) => {
                            return <ListItem data={item} onClick={(data) => {
                                this.setState({
                                    checkSku: data.sku,
                                }, () => {
                                    this.findOrderDetail();
                                })
                            }} />
                        }}
                    />
                </View>
                <View mt={5} flexGrow={0} flexShrink={0}>
                    <InputItem
                        iref={r => this.inputRef1 = r}
                        text='SKU'
                        value={this.state.checkSku}
                        onChange={(value) => {
                            this.setState({ checkSku: value });
                        }}
                        onSubmitEditing={() => {
                            this.findOrderDetail();
                            this.inputRef2?.focus();
                        }}
                    />
                    <Item style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text>{`名称: ${ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.name || ''}`}</Text>
                        <Text>{`计量单位: ${ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.unit || ''}`}</Text>
                        <Text>{`体积: ${ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.volume || ''} ${ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.volumeUnit || '--'}`}</Text>
                        <Text>{`重量: ${ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.weight || ''} ${ProductInfoHelper.skuToProducts[this.state.checkDetail.sku]?.weightUnit || '--'}`}</Text>
                    </Item>
                    <LabelItem label='预报数量' value={`${this.state.checkDetail.forecastQuantity}`} />
                    <LabelItem label='备注' value={`${this.state.checkDetail.remark || ''}`} />
                    <InputNumberItem
                        iref={r => this.inputRef2 = r}
                        text='实际数量'
                        value={this.state.checkDetail.actualQuantity}
                        onChange={(value) => {
                            this.state.checkDetail.actualQuantity = value || 0;
                            this.setState({});
                        }}
                        onSubmitEditing={() => {
                            this.fetchCheck().then((success) => {
                                if (success)
                                    this.inputRef1?.focus();
                            });
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
                            <Text style={{ marginLeft: 16 }}>{Tool.dateFormat(this.state.checkDetail.shelfLise, 'yyyy-MM-dd')}</Text>
                        </TouchableOpacity>
                        <View style={{ flexGrow: 1 }}></View>
                        <TouchableOpacity
                            onPress={() => {
                                this.state.checkDetail.shelfLise = null;
                                this.setState({});
                            }}
                        >
                            <Text>清空</Text>
                        </TouchableOpacity>
                    </Item>
                    {this.state.showDate && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={this.state.checkDetail.shelfLise ? new Date(this.state.checkDetail.shelfLise) : new Date()}
                            mode='date'
                            is24Hour={true}
                            onChange={(event, selectedDate) => {
                                this.state.checkDetail.shelfLise = selectedDate?.toISOString() || null;
                                this.setState({
                                    showDate: false
                                });
                            }}
                        />
                    )}
                    <HStack justifyContent='space-around' mt={5} mb={5}>
                        <Button borderRadius={0} width='43%' size='lg' onPress={() => {
                            this.setState({ showEnforce: true });
                        }}>强制完成</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showEnforce}
                            title='提示'
                            message='是否强制完成查验'
                            onCancel={() => {
                                this.setState({ showEnforce: false });
                            }}
                            onOk={() => {
                                this.fetchToOnShelf().then(() => {
                                    this.setState({ showEnforce: false });
                                });
                            }}
                        />
                        <Button borderRadius={0} width='43%' size='lg' onPress={this.fetchCheck}>查验</Button>
                        <ConfirmDialogModel
                            isOpen={this.state.showFinish}
                            title='提示'
                            message='订单已全部查验，是否完成查验'
                            onCancel={() => {
                                this.setState({ showFinish: false });
                            }}
                            onOk={() => {
                                this.fetchToOnShelf().then(() => {
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
    const location = useLocation();
    const navigate = useNavigate();
    return <Receipt
        location={location}
        navigate={navigate}
    />
}