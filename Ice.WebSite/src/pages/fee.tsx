import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { NextSeo } from 'next-seo';

export default function Home() {
    const router = useRouter();
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NextSeo
                title='小冰-费用'
                description='小冰系统费用明细'
            />
            <div>
                <Header />
                <div className='h-32'></div>
                <main>
                    <div className='container max-w-screen-xl ml-auto mr-auto pl-4 pr-4'>
                        <div className='mt-12'>
                            <h2 className='font-semibold text-3xl text-transparent bg-clip-text'
                                style={{
                                    background: 'linear-gradient(to right,#b84297,#6457c1)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text'
                                }}
                            >现在了解一下我们的收费吧</h2>
                            <p className='mt-4 text-gray-500'>我们提供了定制和非定制2种模式，这2种模式没有好坏之分，要使用哪种模式取决你的现在的业务。</p>
                        </div>
                        <div className='flex flex-wrap sm:flex-nowrap gap-4 mt-8'>
                            <div className={`w-full sm:w-1/2 bg-white rounded-md shadow-md p-8`}>
                                <h3 className='text-center text-3xl font-semibold' style={{ color: '#b84297' }}>非定制</h3>
                                <p className='text-gray-500 mt-4 text-center'>
                                    非定制模式由2部分费用组成：服务开通费，其他费用
                                </p>
                                <div className='mt-8'>
                                    <div className='text-xl font-semibold'>服务开通费</div>
                                    <div className='mt-4 flex flex-col gap-2'>
                                        <p>- AI客服 3000￥/年</p>
                                        <p>- 进销存 700￥/年</p>
                                        <p>- 仓库管理 2000￥/年</p>
                                    </div>
                                </div>
                                <div className='mt-8'>
                                    <div className='text-xl font-semibold'>其他费用</div>
                                    <div className='mt-4 flex flex-col gap-2'>
                                        <p>- 快递面单 0.05 ￥/单（仓库管理可能会用到，由第3方收取）</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`w-full sm:w-1/2 bg-white rounded-md shadow-md p-8`}>
                                <h3 className='text-center text-3xl font-semibold' style={{ color: '#6457c1' }}>定制</h3>
                                <p className='text-gray-500 mt-4 text-center'>
                                    定制模式由2部分费用组成：系统每年的维护费用、定制功能的开发费用
                                </p>
                                <div className='mt-8'>
                                    <div className='text-xl font-semibold'>系统每年的维护费用</div>
                                    <div className='mt-4 flex flex-col gap-2'>
                                        <p>我们会帮你部署和维护你的系统，在使用过程中我们将不会向你收取任何费用，但你每年需要向我们缴纳一定的费用。</p>
                                    </div>
                                </div>
                                <div className='mt-8'>
                                    <div className='text-xl font-semibold'>定制功能的开发费用</div>
                                    <div className='mt-4 flex flex-col gap-2'>
                                        <p>你需要开发的功能我们会单独收费，费用的大小取决于你的需求。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex mt-8'>
                            <p style={{ color: '#b84297' }}>考虑好了吗？你可以通过下方的联系方式联系我们哦</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    )
}
