import React from 'react';
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, ChevronRightIcon } from 'native-base';
import Layout from '../../components/Layout';
import { InputItem, InputNumberItem } from '../../components/Item';
import { ProductInfoApi } from 'ice-core';

class Product extends React.Component<{}> {
    layoutRef: Layout | null = null;
    inputRef1: TextInput | null = null;

    state = {
        entity: {} as any
    }

    fetchCreate = () => {
        if (!this.state.entity.sku) {
            Toast.show({
                title: '请输入SKU'
            });
            return false;
        }

        if (this.state.entity.sku.length > 30) {
            Toast.show({
                title: 'SKU太长了，请重新编辑后提交'
            });
            return false;
        }

        if (!this.state.entity.name) {
            Toast.show({
                title: '请输入产品名'
            });
            return false;
        }

        return ProductInfoApi.create(this.state.entity).then(() => {
            Toast.show({
                title: '成功'
            });
            this.setState({ entity: {} });
        })
    }

    render() {
        return <Layout
            ref={r => this.layoutRef = r}
            title='产品录入'
        >
            <View flex={1}>
                <InputItem
                    text='Sku'
                    value={this.state.entity.sku}
                    onChange={(value) => {
                        this.state.entity.sku = value;
                        this.setState({});
                    }}
                />
                <InputItem
                    text='产品名'
                    value={this.state.entity.name}
                    onChange={(value) => {
                        this.state.entity.name = value;
                        this.setState({});
                    }}
                />
                <InputItem
                    text='计量单位'
                    value={this.state.entity.unit}
                    onChange={(value) => {
                        this.state.entity.unit = value;
                        this.setState({});
                    }}
                />
                <InputNumberItem
                    text='体积'
                    value={this.state.entity.volume}
                    onChange={(value) => {
                        this.state.entity.volume = value;
                        this.setState({});
                    }}
                />
                <InputItem
                    text='体积单位'
                    value={this.state.entity.volumeUnit}
                    onChange={(value) => {
                        this.state.entity.volumeUnit = value;
                        this.setState({});
                    }}
                />
                <InputNumberItem
                    text='重量'
                    value={this.state.entity.weight}
                    onChange={(value) => {
                        this.state.entity.weight = value;
                        this.setState({});
                    }}
                />
                <InputItem
                    text='重量单位'
                    value={this.state.entity.weightUnit}
                    onChange={(value) => {
                        this.state.entity.weightUnit = value;
                        this.setState({});
                    }}
                />
                <View flex={1} />
                <HStack justifyContent='center' mt={5} mb={5}>
                    <Button borderRadius={0} width='100%' size='lg' onPress={this.fetchCreate}>创建</Button>
                </HStack>
            </View>
        </Layout>
    }
}

export default Product;

const styles = StyleSheet.create({
});