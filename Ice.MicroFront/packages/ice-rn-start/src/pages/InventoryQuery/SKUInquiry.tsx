import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View, FlatList } from 'native-base';
import { InputItem, Item } from '../../components/Item';
import { iceFetch } from 'ice-common';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-native';
import { IceStateType, LocationDetailApi } from 'ice-core';

const ListHeader = ({ }) => {
    return <View mt={3} style={styles.ListItem}>
        <Text style={styles.ListItemText1}>库位</Text>
        <Text style={styles.ListItemText2}>数量</Text>
        <Text style={styles.ListItemText3}>批次号</Text>
    </View>
}

const ListItem = (props: { data: any }) => {
    let { data } = props;
    return <TouchableOpacity style={styles.ListItem}>
        <Text style={styles.ListItemText1}>{data.locationCode}</Text>
        <Text style={styles.ListItemText2}>{data.quantity}</Text>
        <Text style={styles.ListItemText3}>{data.inboundBatch}</Text>
    </TouchableOpacity>
}

class SKUInquiry extends React.Component<{
    warehouseId: string
}> {
    state = {
        datas: [],
        // 箱号
        sku: '',
    }

    // 请求列表数据
    fetchDatas = () => {
        if (!this.state.sku) {
            return;
        }

        return LocationDetailApi.getList(
            1,
            50,
            {
                warehouseId: this.props.warehouseId,
                sku: this.state.sku
            } as any,
            'inboundBatch',
            'descend'
        ).then(res => {
            this.setState({ datas: res.datas });
        }).catch(() => { });
    }

    render() {
        return <View flex={1}>
            <View h={3} />
            <InputItem
                text='SKU'
                value={this.state.sku}
                onChange={(value) => {
                    this.setState({ sku: value });
                }}
                onSubmitEditing={this.fetchDatas}
            />
            <ListHeader />
            <View h={1} flexGrow={1}>
                <FlatList
                    data={this.state.datas}
                    renderItem={(item) => {
                        return <ListItem data={item.item} />
                    }}
                />
            </View>
        </View>
    }
}

export default () => {
    const warehouseId = useSelector((state: IceStateType) => state.global.warehouseId)!;
    return <SKUInquiry warehouseId={warehouseId} />
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
        width: '20%'
    },
    ListItemText3: {
        width: '30%'
    },
});