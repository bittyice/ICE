import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Text, HStack, View, Center, Button, Icon } from 'native-base';
import DelayRender from '../DelayRender';
import Loading from './Loading';
import Header from './Header';

export default class extends React.Component<{
    title: string,
    left?: React.ReactNode,
    right?: React.ReactNode,
    renderedCallback?: () => void,
    children?: React.ReactNode
}> {
    render() {
        return <View style={styles.page}>
            <Header
                title={this.props.title}
                left={this.props.left}
                right={this.props.right}
            />
            <DelayRender callback={this.props.renderedCallback}>
                <View flexGrow={1}>
                    {
                        this.props.children
                    }
                    <Loading />
                </View>
            </DelayRender>
        </View>
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1
    },
    header: {
        height: 55,
        flexDirection: 'row'
    },
    headerLeft: {
        width: '50%',
        flexDirection: 'row'
    },
    headerRight: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
});