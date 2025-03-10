import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { theme, Text } from 'native-base';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Layout from '../../components/Layout';

import LocationInquiry from './LocationInquiry';
import SKUInquiry from './SKUInquiry';

const renderScene = SceneMap({
    first: LocationInquiry,
    second: SKUInquiry,
});

const renderTabBar = (props: any) => (
    <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.colors.blue[500] }}
        style={{ backgroundColor: '#fff' }}
        activeColor={theme.colors.blue[500]}
        inactiveColor='#3e3e3e'
    />
);

export default class extends React.Component {
    state = {
        index: 0
    }

    render() {
        return <Layout
            title='库存查询'
        >
            <TabView
                navigationState={{
                    index: this.state.index,
                    routes: [
                        { key: 'first', title: '库位查询' },
                        { key: 'second', title: 'SKU查询' },
                    ]
                }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={(index) => {
                    this.setState({ index: index });
                }}
            />
        </Layout>
    }
}

const styles = StyleSheet.create({
});