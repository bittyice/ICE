import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, } from 'native-base';
import Layout from '../../components/Layout';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import MenuProvider from '../../MenuProvider';
import svgs from '../../statics/svgs';

const MenuItem = (props: {
    menu: {
        url: string,
        text: string
    }
}) => {
    let { menu } = props;
    const nav = useNavigate();

    return <TouchableOpacity style={styles.MenuItemTouchable}
        onPress={() => {
            nav(menu.url);
        }}
    >
        <Center style={styles.MenuItem} p={8} borderRadius={5}>
            <Text>{menu.text}</Text>
        </Center>
    </TouchableOpacity>
}

const SettingBtn = () => {
    const nav = useNavigate();

    return <TouchableOpacity
        style={styles.SettingBtn}
        onPress={() => {
            nav(MenuProvider.getUrl(['setting']));
        }}
    >
        <Icon size='8' color='light.200' as={<SvgXml width={25} height={25} xml={svgs.List} />} />
    </TouchableOpacity>
}

class Home extends React.Component<{
}> {
    render() {
        return <Layout
            title='主页'
            left={<></>}
            right={<SettingBtn />}
        >
            <View style={styles.MenuBody}>
                <Text style={styles.MenuTitle}>入库管理</Text>
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['receipt']),
                    text: '收货'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['check']),
                    text: '验货'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['on-shelf']),
                    text: '上架'
                }} />
                <Text style={styles.MenuTitle}>出库管理</Text>
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['picking']),
                    text: '拣货'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['sorting']),
                    text: '分拣'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['review']),
                    text: '复核'
                }} />
                <Text style={styles.MenuTitle}>库内操作</Text>
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['product']),
                    text: '产品录入'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['on-shelf-noorder']),
                    text: '无单上架'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['off-shelf-noorder']),
                    text: '无单下架'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['warehouse-check']),
                    text: '库存盘点'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['transfer']),
                    text: '移库操作'
                }} />
                <MenuItem menu={{
                    url: MenuProvider.getUrl(['inventory-query']),
                    text: '库存查询'
                }} />
            </View>
        </Layout>
    }
}

const styles = StyleSheet.create({
    MenuBody: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        padding: 16
    },
    MenuTitle: {
        width: '100%',
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
        marginBottom: 15
    },
    MenuItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    MenuItemTouchable: {
        width: '30%',
        marginBottom: 20,
        marginRight: 10
    },
    SettingBtn: {
        paddingLeft: 15,
        paddingRight: 15,
    },
});

export default Home;