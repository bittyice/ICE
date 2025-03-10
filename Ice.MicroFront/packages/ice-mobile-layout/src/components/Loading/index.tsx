import React from 'react';
import { DotLoading } from 'antd-mobile';
import { iceFetchCallBack } from 'ice-common';

class Loading extends React.Component<{
    style?: React.CSSProperties
}> {
    fetchSigns: Array<number> = [];

    style: React.CSSProperties = {
        position: 'fixed', left: '46%', top: '50%', fontSize: 18
    }

    state = {
        loading: false,
    }

    componentDidMount(): void {
        iceFetchCallBack.befores.push(this.beforefun);
        iceFetchCallBack.afters.push(this.afterfun);
        iceFetchCallBack.catchs.push(this.catchfun);
    }

    componentWillUnmount(): void {
        let beforefunIndex = iceFetchCallBack.befores.findIndex(e => e == this.beforefun);
        iceFetchCallBack.befores.splice(beforefunIndex, 1);
        let afterfunIndex = iceFetchCallBack.afters.findIndex(e => e == this.afterfun);
        iceFetchCallBack.afters.splice(afterfunIndex, 1);
        let catchfunIndex = iceFetchCallBack.catchs.findIndex(e => e == this.catchfun);
        iceFetchCallBack.catchs.splice(catchfunIndex, 1);
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
        if (this.state.loading == true)
            return <DotLoading
                style={
                    this.props.style ? {
                        ...this.style,
                        ...this.props.style
                    } : this.style
                }
                color='primary' />;

        return <></>
    }
}
export default Loading;