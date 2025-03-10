import React from 'react';
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, Input, Select, FlatList, Toast, ChevronRightIcon } from 'native-base';
import Layout from '../../components/Layout';
import SelectEX from '../../components/SelectEX';
import { SvgXml } from 'react-native-svg';
import { IceStateType, WarehouseCheckApi, areaSlice, enums } from 'ice-core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import MenuProvider from '../../MenuProvider';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText2}>库区</Text>
        <Text style={styles.ListItemText4}></Text>
    </View>
}

const ListItem = (props: {
    data: any,
    areas: Array<any>,
}) => {
    let { item, index } = props.data;
    const nav = useNavigate();

    return <TouchableOpacity style={styles.ListItem}
        onPress={() => {
            nav(MenuProvider.getUrl(['warehouse-check-action']), {
                state: {
                    warehouseCheck: item
                }
            });
        }}
    >
        <Text style={styles.ListItemText2}>{props.areas.find(e => e.id == item.areaId)?.code}</Text>
        <ChevronRightIcon style={styles.ListItemText4} w={5} size='sm' />
    </TouchableOpacity>
}

class WarehouseCheck extends React.Component<{
    warehouseId: string,
    areas: Array<any>,
    fetchAreas: () => Promise<any>,
}> {
    inputRef1: TextInput | null = null;

    state = {
        code: '',
        datas: []
    }

    componentDidMount(): void {
        this.fetchList();
        this.fetchOtherDatas();
    }

    fetchOtherDatas = () => {
        return Promise.all([
            this.props.fetchAreas(),
        ]);
    }

    fetchList = () => {
        return WarehouseCheckApi.getList(
            1,
            50,
            {
                status: enums.WarehouseCheckStatus.Checking,
            },
            'creationTime',
            'descend'
        ).then((datas) => {
            this.setState({ datas: datas.datas });
        });
    }

    render() {
        return <Layout
            title='盘点'
        >
            <View flex={1}>
                <ListHeader />
                <View h={1} flexGrow={1}>
                    <FlatList
                        data={this.state.datas}
                        renderItem={(item) => {
                            return <ListItem
                                data={item}
                                areas={this.props.areas}
                            />
                        }}
                    />
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
    return <WarehouseCheck
        warehouseId={warehouseId}
        areas={areas}
        fetchAreas={fetchDatas}
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
    // ListItemText1: {
    //     width: '50%'
    // },
    ListItemText2: {
        width: '93%'
    },
    ListItemText4: {
        width: '6%'
    }
});