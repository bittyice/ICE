import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from 'react-redux';
import { PageProvider, ModuleFactory } from 'icetf';
import { store } from 'ice-core';
import { ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en-gb';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';

// 导入当前模块
import './Module'
import './index.css';

dayjs.locale('zh-cn');

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

        return <ConfigProvider locale={zhCN}
            theme={{
                algorithm: theme.compactAlgorithm,
                token: {
                    colorPrimary: '#722ed1',
                }
            }}
        >
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                        {
                            PageProvider.pages.map(item => (<Route key={item.name} path={item.url} element={item.element} />))
                        }
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ConfigProvider>
    }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();