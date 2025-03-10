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

import ai_1_img from '@/statics/images/ai-1.png';
import ai_2_img from '@/statics/images/ai-2.png';
import ai_3_img from '@/statics/images/ai-3.png';
import ai_4_img from '@/statics/images/ai-4.png';

const Section1 = () => {
    return <section className='flex items-center'>
        <div className='w-full md:w-1/2 flex flex-col gap-6 pt-8 pb-8'>
            <div className='flex items-center gap-4'>
                <h2 className='text-4xl xl:text-5xl font-bold'>小冰</h2>
                <img src={foreversvg.src} />
            </div>
            <div className='flex items-center gap-4'>
                <h2 className='text-4xl xl:text-5xl font-bold'>
                    <span>AI客服</span>
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
                基于ChatGPT的AI客服，24小时全天候自动回复。
            </p>
            <p style={{ lineHeight: '26px' }}>
                AI 客服提供了 AI 客服自动回复消息功能，人工客服也可以手动回复，可以将我们的 AI 客服插入到你的官网、后台系统或者公众号，让 AI 客服成为你的客服或者你产品的一个使用指南。
            </p>
        </div>
        <div className='hidden md:flex gap-4 w-1/2 p-8 items-center'>
            <div className='w-3/4'>
                <img className='w-full' src={ai_1_img.src} />
            </div>
            <div className='w-1/4'>
                <img className='w-full' src={ai_2_img.src} />
            </div>
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
const Section2 = () => {
    return <section>
        <div>
            <h2 className='text-4xl font-bold'>功能介绍</h2>
            <p className='mt-4 text-gray-500'>下面我们带你简单了解一下AI客服提供的功能</p>
        </div>
        <div className='flex flex-wrap md:flex-nowrap gap-8 mt-6'>
            <SectionCard
                className='w-full md:w-1/3'
                title='AI自动回复'
                content='你只需要上传你的知识库，AI会根据该知识库自动回答访客的问题。'
                img={home_section3_1_img.src}
            />
            <SectionCard
                className='w-full md:w-1/3'
                title='人工手动回复'
                content='在AI与访客的聊天过程中，你可以手动关闭AI作答并自己回复访客消息。'
                img={home_section3_2_img.src}
            />
            <SectionCard
                className='w-full md:w-1/3'
                title='AI问卷调查'
                content='在每次交谈结束后，AI会根据你上传的问卷进行一个总结。'
                img={home_section3_4_img.src}
            />
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
                title='小冰-AI客服'
                description='基于ChatGPT的AI客服，轻松嵌入官网、公众号、小程序'
            />
            <div>
                <Header />
                <div className='h-32'></div>
                <main>
                    <div className='container max-w-screen-xl ml-auto mr-auto pl-4 pr-4'>
                        <div className='h-12' />
                        <Section1 />
                        <div className='h-12' />
                        <section>
                            <div>
                                <h2 className='text-4xl font-bold'>快速开始</h2>
                                <p className='mt-4 text-gray-500'>如何使用我们的AI客服？</p>
                            </div>
                            <div className='flex mt-4 shadow bg-white rounded'>
                                <div className='w-1/3'>
                                    <img src={ai_3_img.src} />
                                </div>
                                <div className='flex flex-col p-6 items-start'>
                                    <div className='mb-4 font-semibold text-lg'>只需要3步即可，你就可以拥有自己的AI客服</div>
                                    <div>1、注册</div>
                                    <div>2、上传你的知识库</div>
                                    <div>3、将AI客服插入你的官网或者公众号、小程序中</div>
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
                        <Section2 />
                        <div className='h-12'></div>
                        <section>
                            <div>
                                <h2 className='text-4xl font-bold'>体验一下？</h2>
                                <p className='mt-4 text-gray-500'>右下角就是我们官网的AI客服，去问问他一些问题吧。</p>
                            </div>
                            <div className='mt-2'>
                                <img className='w-full' src={ai_4_img.src} />
                            </div>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    )
}
