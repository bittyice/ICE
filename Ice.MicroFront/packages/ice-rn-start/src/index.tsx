import React from 'react';
import { NativeRouter, Route, Routes } from "react-router-native";
import { Provider } from 'react-redux';
import { PageProvider, ModuleFactory } from 'icetf';
import { store } from 'ice-core';
import { NativeBaseProvider } from 'native-base';

// 导入当前模块
import './Module'

class App extends React.Component {
    state = {
        init: false
    }

    componentDidMount(): void {
        ModuleFactory.init().then(() => {
            this.setState({ init: true });
        });
    }

    render() {
        if (!this.state.init) {
            return <></>
        }

        return <NativeBaseProvider>
            <Provider store={store}>
                <NativeRouter>
                    <Routes>
                        {
                            PageProvider.pages.map(item => (<Route key={item.name} path={item.url} element={item.element} />))
                        }
                    </Routes>
                </NativeRouter>
            </Provider>
        </NativeBaseProvider>
    }
}

export default App;