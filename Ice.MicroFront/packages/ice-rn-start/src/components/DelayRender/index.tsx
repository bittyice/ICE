import React from 'react';
import { Spinner, Center } from 'native-base';
import { ActivityIndicator } from 'react-native';

// 延迟渲染
export default class extends React.Component<{
    callback?: () => void,
    children?: React.ReactNode
}> {
    state = {
        isShow: false
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({isShow: true}, this.props.callback);
        })
    }

    render() {
        if(this.state.isShow == false){
            return <></>;
        }

        return this.props.children
    }
}