import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, ChevronRightIcon } from 'native-base';
import Layout from '../../components/Layout';
import { Storage } from 'ice-common';
import { SvgXml } from 'react-native-svg';
import SelectEX from '../../components/SelectEX';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { IceStateType, globalSlice } from 'ice-core';
import svgs from '../../statics/svgs';
import { createClearReduxDatasAction, token } from 'ice-common';

const storageKey = '_curwarehouse_';

const ListItem = (props: { text: string, routeName: string }) => {
    const nav = useNavigate();

    return <TouchableOpacity style={styles.ListItem}
        onPress={() => {
            if (props.routeName) {
                nav(`/${props.routeName}`);
            }
        }}
    >
        <Text>{props.text}</Text>
        <ChevronRightIcon size='8' />
    </TouchableOpacity>
}

const Setting = () => {
    const warehouse = useSelector((state: IceStateType) => state.global.warehouse);
    const warehouses = useSelector((state: IceStateType) => state.warehouse.allDatas) || [];
    const user = useSelector((state: IceStateType) => state.global.user);
    const tenant = useSelector((state: IceStateType) => state.global.tenant);
    const nav = useNavigate();
    const dispatch = useDispatch();

    return <Layout
        title='设置'
    >
        <View flex={1}>
            <HStack bg='#fff' mt={3} alignItems='center' p={5}>
                <View>
                    <Icon as={<SvgXml width={50} height={50} xml={svgs.User} />} />
                </View>
                <View ml={5}>
                    <Text fontSize={20}>{user.userName}</Text>
                    <Text mt={1} fontSize={16}>{tenant.amount} ￥</Text>
                </View>
            </HStack>
            <View mt={3}>
                <SelectEX
                    style={{
                        backgroundColor: '#fff',
                        marginBottom: 20,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 8,
                        paddingBottom: 8,
                    }}
                    selectedValue={warehouse.id}
                    onValueChange={(val) => {
                        let warehouse = warehouses.find(e => e.id == val);
                        dispatch(globalSlice.actions.setWarehouse({ warehouse: warehouse }));
                        Storage.setItem(storageKey, val);
                    }}
                    datas={warehouses.map(item => ({
                        label: item.name!,
                        value: item.id!
                    }))}
                    placeholder='选择仓库'
                />
                <ListItem text='关于' routeName='' />
            </View>
            <View flexGrow={1} />
            <Button mb={5} borderRadius={0} h={12} size='lg' colorScheme='danger'
                onPress={() => {
                    token.clearToken();
                    dispatch(createClearReduxDatasAction());
                    nav(`/login`);
                }}
            >退出登录</Button>
        </View>
    </Layout>
}

export default Setting;

const styles = StyleSheet.create({
    ListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
        backgroundColor: '#fff',
        marginBottom: 1,
        alignItems: 'center',
        paddingLeft: 25,
        paddingRight: 25
    }
});