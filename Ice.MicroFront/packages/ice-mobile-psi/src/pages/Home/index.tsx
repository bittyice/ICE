import React from 'react';
import { Column } from '@ant-design/plots';
import { iceFetch } from 'ice-common';
import { Space } from 'antd-mobile';
import Icon, {
    AppstoreAddOutlined,
    CarOutlined,
    FileTextOutlined,
    HomeOutlined,
    DashboardOutlined,
    BarsOutlined,
    BarChartOutlined,
    FileSearchOutlined,
    SnippetsOutlined,
    DotChartOutlined,
    MoneyCollectOutlined,
    DropboxOutlined,
    AuditOutlined,
    FileDoneOutlined,
    PieChartOutlined,
    FundOutlined,
    StockOutlined,
    ShopOutlined,
    RadarChartOutlined,
    BookOutlined,
    ApartmentOutlined,
    AppleOutlined,
    WalletOutlined,
    LineChartOutlined,
    AreaChartOutlined,
    FallOutlined,
    RiseOutlined,
    HeatMapOutlined,
    SlidersOutlined,
    FundProjectionScreenOutlined,
} from '@ant-design/icons';
import { MenuProvider } from 'ice-mobile-layout';
import { useNavigate } from 'react-router';
import { PSIOtherApi } from 'ice-core';
import JumpItems from './JumpItems';

const LinkItem = (props: {
    text: React.ReactNode,
    icon: React.ReactNode,
    url: string,
}) => {
    const nav = useNavigate();

    return <div className='p-4 flex flex-col items-center w-full' onClick={() => {
        nav(props.url);
    }}>
        <div>{props.icon}</div>
        <div className='mt-2'>{props.text}</div>
    </div>
}

class Home extends React.Component<{}> {
    state = {
        todayIncome: {
            income: 0,
            purchaseNotPay: 0,
            saleNotPay: 0,
        }
    }

    componentDidMount() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
        PSIOtherApi.getAllFeeAnalyseAsync({
            startTime: start,
            endTime: end,
        }).then(data => {
            let income = (data.purchaseReturn?.feeTotal || 0) + (data.sale?.feeTotal || 0) - (data.purchase?.feeTotal || 0) - (data.saleReturn?.feeTotal || 0)
            let purchaseNotPay = (data.purchase?.feeTotal || 0) - (data.purchase?.feeTotalPaid || 0);
            let saleNotPay = (data.sale?.feeTotal || 0) - (data.sale?.feeTotalPaid || 0);
            this.setState({
                todayIncome: {
                    income: income,
                    purchaseNotPay: purchaseNotPay,
                    saleNotPay: saleNotPay,
                }
            })
        });
    }

    render(): React.ReactNode {
        return <div className='p-4'>
            <div className='themebg rounded-md text-white p-6'>
                <div className='text-xl flex justify-between items-center'>
                    <span>今日营收</span>
                    <AppstoreAddOutlined />
                </div>
                <div className='text-4xl mt-4 text-green-200'>{this.state.todayIncome.income} ￥</div>
                <div className='flex justify-between mt-4'>
                    <span>采购待支付：{this.state.todayIncome.purchaseNotPay}￥</span>
                    <span>销售未支付：{this.state.todayIncome.saleNotPay}￥</span>
                </div>
            </div>
            <div className='rounded-md bg-white mt-2 overflow-hidden'>
                <div className='p-6 text-xl themebg-r text-white'>待处理订单</div>
                <JumpItems />
            </div>
            <div className='rounded-md bg-white mt-8 overflow-hidden'>
                <div className='p-6 text-xl bg-purple-800 text-white'>订单</div>
                <div className='flex'>
                    <LinkItem
                        text='采购订单'
                        icon={<AuditOutlined />}
                        url={MenuProvider.getUrl(['purchase-order'])}
                    />
                    <LinkItem
                        text='采购退货'
                        icon={<FileDoneOutlined />}
                        url={MenuProvider.getUrl(['purchase-return-order'])}
                    />
                    <LinkItem
                        text='销售订单'
                        icon={<FileTextOutlined />}
                        url={MenuProvider.getUrl(['sale-order'])}
                    />
                    <LinkItem
                        text='销售退货'
                        icon={<BookOutlined />}
                        url={MenuProvider.getUrl(['sale-return-order'])}
                    />
                </div>
            </div>
            <div className='rounded-md bg-white mt-8 overflow-hidden'>
                <div className='p-6 text-xl bg-purple-800 text-white'>报表</div>
                <div className='flex'>
                    <LinkItem
                        text='统 计'
                        icon={<HomeOutlined />}
                        url={MenuProvider.getUrl(['statistics'])}
                    />
                    <LinkItem
                        text='费 用'
                        icon={<FundProjectionScreenOutlined />}
                        url={MenuProvider.getUrl(['fee-analyse'])}
                    />
                    <LinkItem
                        text='营业额'
                        icon={<BarChartOutlined />}
                        url={MenuProvider.getUrl(['turnover-statistics'])}
                    />
                    <LinkItem
                        text='进销存'
                        icon={<DotChartOutlined />}
                        url={MenuProvider.getUrl(['invoicing'])}
                    />
                </div>
                <div className='flex'>
                    <LinkItem
                        text='采购费用'
                        icon={<LineChartOutlined />}
                        url={MenuProvider.getUrl(['purchase-fee-inquiry'])}
                    />
                    <LinkItem
                        text='采退费用'
                        icon={<DotChartOutlined />}
                        url={MenuProvider.getUrl(['purchase-return-fee-inquiry'])}
                    />
                    <LinkItem
                        text='销售费用'
                        icon={<HeatMapOutlined />}
                        url={MenuProvider.getUrl(['sale-fee-inquiry'])}
                    />
                    <LinkItem
                        text='销退费用'
                        icon={<SlidersOutlined />}
                        url={MenuProvider.getUrl(['store-ruturn-fee-inquiry'])}
                    />
                </div>
            </div>
        </div>
    }
}

export default Home;