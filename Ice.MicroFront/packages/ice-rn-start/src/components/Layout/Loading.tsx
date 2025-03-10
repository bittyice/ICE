import React from 'react';
import { ActivityIndicator } from 'react-native';
import { iceFetchCallBack } from 'ice-common';
import { useLocation } from 'react-router-native';

class Loading extends React.Component<{
    location: any
}> {
    fetchSigns: Array<number> = [];

    state = {
        loading: false
    }

    componentDidMount() {
        

        iceFetchCallBack.befores.push(this.beforefun);
        iceFetchCallBack.afters.push(this.afterfun);
        iceFetchCallBack.catchs.push(this.catchfun);

        return () => {
            let beforefunIndex = iceFetchCallBack.befores.findIndex(e => e === this.beforefun);
            iceFetchCallBack.befores.splice(beforefunIndex, 1);
            let afterfunIndex = iceFetchCallBack.afters.findIndex(e => e === this.afterfun);
            iceFetchCallBack.afters.splice(afterfunIndex, 1);
            let catchfunIndex = iceFetchCallBack.catchs.findIndex(e => e === this.catchfun);
            iceFetchCallBack.catchs.splice(catchfunIndex, 1);
        }
    }

    // 注册 fetch 回调函数
    beforefun = (params: {
        input: string,
        init: RequestInit | undefined,
        fetchSign: number
    }) => {
        this.fetchSigns.push(params.fetchSign);
        this.setState({ loading: true });
    }

    afterfun = (params: {
        input: string,
        init: RequestInit | undefined,
        res: any,
        fetchSign: number
    }) => {
        let index = this.fetchSigns.findIndex(e => e == params.fetchSign);
        this.fetchSigns.splice(index, 1);
        if (this.fetchSigns.length == 0) {
            this.setState({ loading: false });
        }
    }

    catchfun = (params: {
        input: string,
        init: RequestInit | undefined,
        ex: any,
        fetchSign: number
    }) => {
        let index = this.fetchSigns.findIndex(e => e == params.fetchSign);
        this.fetchSigns.splice(index, 1);
        if (this.fetchSigns.length == 0) {
            this.setState({ loading: false });
        }
    }

    render() {
        return <ActivityIndicator size='large' accessibilityLabel="Loading posts"
            style={{
                display: this.state.loading ? 'flex' : 'none',
                position: 'absolute',
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999
            }}
        />
    }
}

export default () => {
    const location = useLocation();
    return <Loading
        location={location}
    />
};