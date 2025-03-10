import React, { useEffect } from 'react';
import OffShelf from './OffShelf';
import OnShelf from './OnShelf';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Layout from '../../components/Layout';
import { theme } from 'native-base';

const renderTabBar = (props: any) => (
    <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.colors.blue[500] }}
        style={{ backgroundColor: '#fff' }}
        activeColor={theme.colors.blue[500]}
        inactiveColor='#3e3e3e'
    />
);

class Page extends React.Component<{}> {
    layoutRef: Layout | null = null;

    state = {
        index: 0
    }

    renderScene = SceneMap({
        first: () => <OffShelf />,
        second: () => <OnShelf />
    });

    render() {
        return <Layout
            ref={r => this.layoutRef = r}
            title='移库操作'
        >
            <TabView
                navigationState={{
                    index: this.state.index,
                    routes: [
                        { key: 'first', title: '下架' },
                        { key: 'second', title: '上架' },
                    ]
                }}
                renderScene={this.renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={(index) => {
                    this.setState({ index: index });
                }}
            />
        </Layout>
    }
}

export default Page;