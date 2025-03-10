import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { NextSeo } from 'next-seo';

import aspnetsvg from '@/statics/icons/aspnet.svg';
import foreversvg from '@/statics/icons/forever.svg';
import rightsvg from '@/statics/icons/right.svg';
import selectsvg from '@/statics/icons/select.svg';
import icon_11svg from '@/statics/icons/icon-11.svg';
import warehousesvg from '@/statics/icons/warehouse.svg';
import storesvg from '@/statics/icons/store.svg';

import home_section3_1_img from '@/statics/images/home-section3-1.png';
import home_section3_2_img from '@/statics/images/home-section3-2.png';
import home_section3_3_img from '@/statics/images/home-section3-3.webp';
import home_section3_4_img from '@/statics/images/home-section3-4.png';
import home_section5_1_img from '@/statics/images/home-section5-1.webp';
import home_section5_2_img from '@/statics/images/home-section5-1.webp';

import wms_1_img from '@/statics/images/wms-1.png';
import wms_2_img from '@/statics/images/wms-2.png';

const Section1 = () => {
    return <section className='flex items-center'>
        <div className='w-full md:w-1/2 flex flex-col gap-6 pt-8 pb-8'>
            <div className='flex items-center gap-4'>
                <h2 className='text-4xl xl:text-5xl font-bold'>小冰</h2>
                <img src={foreversvg.src} />
            </div>
            <div className='flex items-center gap-4'>
                <h2 className='text-4xl xl:text-5xl font-bold'>
                    <span>仓库管理</span>
                    <span className='text-transparent bg-clip-text ml-4'
                        style={{
                            background: 'linear-gradient(to right,#b84297,#6457c1)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text'
                        }}
                    >SaaS</span>
                </h2>
                <img className='hidden sm:block' src={aspnetsvg.src} />
            </div>
            <p style={{ lineHeight: '26px' }}>
                标准仓库作业流程，让你的仓库作业更高效。
            </p>
            <p style={{ lineHeight: '26px' }}>
                我们的仓库管理系统是一款高效、智能的软件解决方案，它可以帮助企业实现对整个库存
                的可见性，并协调和优化资源使用。我们的系统具有入库管理、出库管理、拣货管理、库
                内管理、批次号管理、过期产品管理等功能，并且还提供了 PDA APP，可以轻松在手机上
                完成操作。
            </p>
        </div>
        <div className='hidden md:flex gap-4 w-1/2 p-8 items-center'>
            <img className='w-full' src={wms_2_img.src} />
        </div>
    </section>
}

const SectionCard = (props: {
    className: string,
    title: string,
    content: string,
    img: string
}) => {
    return <div className={`${props.className} shadow-md p-8 rounded-md flex flex-col gap-4 bg-white`}>
        <h4 className='text-2xl font-semibold'>{props.title}</h4>
        <p className='text-gray-500 break-words' style={{ lineHeight: '26px' }}>{props.content}</p>
        <div className='w-full flex justify-center'>
            <img src={props.img} alt="" />
        </div>
    </div>
}
const Section = () => {
    return <section>
        <div>
            <h2 className='text-4xl font-bold'>了解一下仓储服务？</h2>
            <p className='mt-4 text-gray-500'>下面我们带你简单了解一下仓储服务提供的功能</p>
        </div>
        <div className='flex flex-wrap md:flex-nowrap gap-8 mt-6'>
            <SectionCard
                className='w-full md:w-1/3'
                title='仓库管理'
                content='你可以建立多个仓库并分别管理这些仓库'
                img={home_section3_2_img.src}
            />
            <SectionCard
                className='w-full md:w-1/3'
                title='订单管理'
                content='你可以在这个平台上面管理你的出入库订单。'
                img={home_section3_1_img.src}
            />
            <SectionCard
                className='w-full md:w-1/3'
                title='上架、下架推荐'
                content='我们提供了上下架推荐算法、让系统去管理你的库存。'
                img={home_section3_4_img.src}
            />
        </div>
        <div className='flex flex-wrap md:flex-nowrap gap-8 mt-6'>
            <SectionCard
                className='w-full md:w-2/3'
                title='库内管理'
                content='你可以管理你的库位，库存，出入库订单等信息，你可以在这里进行仓库作业（如收货、验货、上架、拣货、下架、分拣、盘点、移库、调拨等操作）。'
                img={home_section3_3_img.src}
            />
            <div className='w-full md:w-1/3'>
                <SectionCard
                    className='w-full'
                    title='快递面单'
                    content='我们对接了40+快递公司，你可以直接在我们系统上打印快递面单。'
                    img={home_section3_4_img.src}
                />
                <SectionCard
                    className='w-full mt-8'
                    title='PDA手持终端'
                    content='为了更好的仓库作业，我们提供了PDA，你可以在PDA上面进行收货、验货、上架、拣货、下架等操作。'
                    img={home_section3_4_img.src}
                />
            </div>
        </div>
    </section>
}

export default function Home() {
    const router = useRouter();
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NextSeo
                title='小冰-仓库管理系统'
                description='标准的仓库作业流程，让你的仓库作业更高效'
            />
            <div>
                <Header />
                <div className='h-32'></div>
                <main>
                    <div className='container max-w-screen-xl ml-auto mr-auto pl-4 pr-4'>
                        <div className='h-12'></div>
                        <Section1 />
                        <div className='h-12'></div>
                        <section className='mt-12'>
                            <div>
                                <h2 className='text-4xl font-bold'>快速开始</h2>
                                <p className='mt-4 text-gray-500'>如何使用我们的仓库管理？</p>
                            </div>
                            <div className='flex mt-4 shadow bg-white rounded'>
                                <div className='w-1/3'>
                                    <img src={wms_1_img.src} />
                                </div>
                                <div className='flex flex-col p-6 items-start'>
                                    <div className='mb-4 font-semibold text-lg'>只需要3步即可</div>
                                    <div>1、注册</div>
                                    <div>2、建立你的仓库、库位、产品信息</div>
                                    <div>3、录入订单</div>
                                    <div className='flex-grow'></div>
                                    <div className=''>
                                        <Link className='pl-4 pr-4 pt-2 pb-2 rounded-md text-white flex gap-2 items-center' style={{ backgroundColor: '#6457c1' }}
                                            target='_blank'
                                            href='https://www.bittyice.cn/pc/login/admin'
                                        >
                                            <span>去使用</span>
                                            <img className='h-5' src={rightsvg.src} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <div className='h-12'></div>
                        <Section />
                        <div className='h-12'></div>
                        <div className='container max-w-screen-xl ml-auto mr-auto relative flex items-center'>
                            <div className='flex flex-wrap md:flex-nowrap w-full p-10 md:p-20 justify-between text-white rounded-xl shadow-lg items-end'
                                style={{
                                    background: 'linear-gradient(to right,#6457c1,#b84297)'
                                }}
                            >
                                <div className='w-full pr-8'>
                                    <h4 className='text-3xl font-semibold'>现在，你想试用一下吗？</h4>
                                    <p className='mt-4'>你可以直接注册我们的账号，我们提供了15天的免费试用，现在去试一下吧！</p>
                                </div>
                                <div className='flex-shrink-0 mt-4 md:mt-0'>
                                    <Link className='p-4 pl-8 pr-8 xl:pl-12 xl:pr-12 rounded-md text-white flex gap-2 items-center shadow-md' style={{ backgroundColor: '#6457c1' }}
                                        target='_blank'
                                        href='https://www.bittyice.cn/pc/login/admin'
                                    >
                                        <span>现在出发</span>
                                        <img className='h-5' src={rightsvg.src} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    )
}
