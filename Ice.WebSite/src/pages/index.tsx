import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'

import aspnetsvg from '@/statics/icons/aspnet.svg';
import foreversvg from '@/statics/icons/forever.svg';
import rightsvg from '@/statics/icons/right.svg';
import selectsvg from '@/statics/icons/select.svg';
import icon_11svg from '@/statics/icons/icon-11.svg';
import warehousesvg from '@/statics/icons/warehouse.svg';
import storesvg from '@/statics/icons/store.svg';

import home_section6_1svg from '@/statics/icons/home-section6-1.svg';
import home_section6_2svg from '@/statics/icons/home-section6-2.svg';
import home_section6_3svg from '@/statics/icons/home-section6-3.svg';
import home_section6_4svg from '@/statics/icons/home-section6-4.svg';
import home_section6_5svg from '@/statics/icons/home-section6-5.svg';
import home_section6_6svg from '@/statics/icons/home-section6-6.svg';
import home_section6_7svg from '@/statics/icons/home-section6-7.svg';
import home_section6_8svg from '@/statics/icons/home-section6-8.svg';
import home_section6_9svg from '@/statics/icons/home-section6-9.svg';
import home_section6_10svg from '@/statics/icons/home-section6-10.svg';

import logo_angularsvg from '@/statics/icons/logo-angular.svg';
import logo_blazorsvg from '@/statics/icons/logo-blazor.svg';
import logo_mvcsvg from '@/statics/icons/logo-mvc.svg';
import logo_entity_frameworksvg from '@/statics/icons/logo-entity-framework.svg';
import logo_mongosvg from '@/statics/icons/logo-mongo.svg';
import logo_dappersvg from '@/statics/icons/logo-dapper.svg';

import home_1_img from '@/statics/images/home_1.webp';
import home_section3_1_img from '@/statics/images/home-section3-1.png';
import home_section3_2_img from '@/statics/images/home-section3-2.png';
import home_section3_3_img from '@/statics/images/home-section3-3.webp';
import home_section3_4_img from '@/statics/images/home-section3-4.png';
import home_section5_1_img from '@/statics/images/home-section5-1.webp';
import home_section5_2_img from '@/statics/images/home-section5-1.webp';

import wxgzhimg from '@/statics/images/wxgzh.jpg';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Section1 = () => {
  return <section className='flex items-center'>
    <div className='w-full md:w-1/2 flex flex-col gap-6 pt-8 pb-8'>
      <div className='flex items-center gap-4'>
        <h2 className='text-4xl xl:text-5xl font-bold'>小冰</h2>
        <img src={foreversvg.src} />
      </div>
      <div className='flex items-center gap-4'>
        <h2 className='text-4xl xl:text-5xl font-bold'>
          <span>助力企业数字化</span>
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
        小冰助手由 AI客服、进销存、仓库管理 组成，基于SaaS模式，注册直接使用，我们的目标是助力中小企业数字化转型。
      </p>
      <div className='flex gap-4'>
        <Link className='p-4 rounded-md text-white' style={{ backgroundColor: '#b84297' }} href='/docs/ai'>文档教程</Link>
        <Link className='p-4 rounded-md text-white flex gap-2 items-center' style={{ backgroundColor: '#6457c1' }}
          target='_blank'
          href='https://www.bittyice.cn/pc/login/admin'
        >
          <span>去使用</span>
          <img className='h-5' src={rightsvg.src} />
        </Link>
      </div>
    </div>
    <div className='hidden md:block w-1/2 p-8'>
      <img className='w-full' src={home_1_img.src} />
    </div>
  </section>
}

const Section2Item = (props: {
  text: string,
  color: string
}) => {
  return <div className='flex justify-between rounded-md p-4 w-44' style={{ backgroundColor: props.color }}>
    <h4 className='text-white text-base'>{props.text}</h4>
    <img className='h-14' src={icon_11svg.src} alt="" />
  </div>
}
const Section2 = () => {
  return <section>
    <div>
      <h2 className='text-4xl font-bold'>我们提供的服务</h2>
      <p className='text-gray-500 mt-4'>我们提供了 AI客服、进销存、仓库管理，你可以根据你的需要自行开通。</p>
    </div>
    <div className='flex flex-wrap lg:flex-nowrap mt-8 gap-8 items-start'>
      <div className='w-full lg:w-1/3 shadow rounded-md p-8 bg-white'>
        <h2 className='text-3xl font-bold'>AI客服</h2>
        <p className='mt-4 text-gray-500'>基于ChatGPT的客服，可在人工与AI之间切换，可嵌入你的官网、公众号、小程序等</p>
        <div className='flex flex-wrap gap-4 mt-4'>
          <Section2Item text='人工回复' color='#722ed1' />
          <Section2Item text='AI回复' color='#722ed1' />
          <Section2Item text='知识库管理' color='#22075e' />
          <Section2Item text='AI问卷调查' color='#a0d911' />
        </div>
      </div>
      <div className='w-full lg:w-1/3 shadow rounded-md p-8 bg-white'>
        <h2 className='text-3xl font-bold'>进销存</h2>
        <p className='mt-4 text-gray-500'>详细的账单和报表，支持打单，支持手机端，不用再手动记账了</p>
        <div className='flex flex-wrap gap-4 mt-4'>
          <Section2Item text='订单管理' color='#722ed1' />
          <Section2Item text='价格管理' color='#722ed1' />
          <Section2Item text='报表' color='#22075e' />
          <Section2Item text='手机端' color='#a0d911' />
        </div>
      </div>
      <div className='w-full lg:w-1/3 shadow rounded-md p-8 bg-white'>
        <h2 className='text-3xl font-bold'>仓库管理</h2>
        <p className='mt-4 text-gray-500'>仓库管理包含订单管理、库内管理、PDA程序等，并支持打印面单</p>
        <div className='flex flex-wrap gap-4 mt-4'>
          <Section2Item text='订单管理' color='#722ed1' />
          <Section2Item text='库内操作' color='#722ed1' />
          <Section2Item text='快递面单' color='#22075e' />
          <Section2Item text='手持终端PDA' color='#fa8c16' />
        </div>
      </div>
    </div>
  </section>
}

const Section4Img = (props: {
  src: string
}) => {
  return <img className='w-24 xl:w-32' src={props.src} alt="" />
}
const Section4 = () => {
  return <section>
    <div>
      <h2 className='text-4xl font-bold'>定制开发？</h2>
      <p className='mt-4 text-gray-500'>我们提供了定制开发服务，来看下我们使用的技术？需要的话可以联系我们哦。</p>
    </div>
    <div className='flex flex-wrap md:flex-nowrap mt-8'>
      <div className='w-full md:w-1/2'>
        <video className='w-full' src="/lepton-x-animation.webm" autoPlay></video>
      </div>
      <div className='w-full md:w-1/2 mt-8 md:mt-0 md:ml-12 xl:ml-20'>
        <div>
          <h4 className='xl xl:text-2xl'>UI技术</h4>
          <div className='flex gap-12 mt-4 xl:mt-8'>
            <Section4Img src={logo_angularsvg.src} />
            <Section4Img src={logo_blazorsvg.src} />
            <Section4Img src={logo_mvcsvg.src} />
          </div>
        </div>
        <div className='mt-4 md:mt-8 xl:mt-16'>
          <h4 className='xl xl:text-2xl'>数据库选项</h4>
          <div className='flex gap-12 mt-4 xl:mt-8'>
            <Section4Img src={logo_entity_frameworksvg.src} />
            <Section4Img src={logo_mongosvg.src} />
            <Section4Img src={logo_dappersvg.src} />
          </div>
        </div>
        <div className='mt-12'>
          <Link href='/#footer' className='p-3 md:lg xl:text-xl font-semibold text-white rounded-md inline-block' style={{ backgroundColor: '#b84297' }}>现在联系我们</Link>
        </div>
      </div>
    </div>
  </section>
}

const Section5Item = (props: {
  className: string,
  title: string,
  content: string,
  img: string,
  linkText: string,
  linkUrl: string,
}) => {
  return <div className={`${props.className} bg-white rounded-md shadow-md p-8`}>
    <h3 className='text-center text-3xl font-semibold'>{props.title}</h3>
    <p className='text-gray-500 mt-4 text-center'>{props.content}</p>
    <img className='h-96 mt-4 ml-auto mr-auto' src={props.img} alt="" />
    <div className='mt-4 flex justify-center'>
      <Link
        href={props.linkUrl}
        className='pt-3 pb-3 pl-20 pr-20 font-semibold text-white rounded-md inline-block'
        style={{ backgroundColor: '#b84297' }}
      >{props.linkText}</Link>
    </div>
  </div>
}
const Section5 = () => {
  return <section className='flex flex-wrap md:flex-nowrap gap-8'>
    <Section5Item
      className='w-full md:w-1/2'
      title='非定制'
      content='你可以直接注册并使用我们的系统，你需要在系统上进行充值，然后开通你需要的服务即可。'
      img={home_section5_1_img.src}
      linkText='好像很划算'
      linkUrl='/#footer'
    />
    <Section5Item
      className='w-full md:w-1/2'
      title='定制'
      content='我们会根据你的需求，开发专属于你的系统，我们会帮你部署和维护该系统，而你每年需要向我们缴纳一定的费用。'
      img={home_section5_2_img.src}
      linkText='听起来不错'
      linkUrl='/#footer'
    />
  </section>
}

const Section6Item = (props: {
  className: string,
  backgroundColor?: string,
  icon: string,
  text: string
}) => {
  return <div className={`${props.className} w-16 sm:w-24 xl:w-28`}>
    <div className='w-16 sm:w-24 xl:w-28 p-4 sm:p-8 rounded-full bg-white'
      style={{
        boxShadow: '0px 0px 20px #6457c120',
        backgroundColor: props.backgroundColor
      }}
    >
      <img className='w-full h-full' src={props.icon} alt="" />
    </div>
    <p className='sm:text-lg xl:text-2xl text-center mt-4'>{props.text}</p>
  </div>
}
const Section6 = () => {
  const data1s = [{
    className: '',
    icon: home_section6_1svg.src,
    text: 'AI 回复'
  }, {
    className: 'mt-20',
    icon: home_section6_2svg.src,
    text: '采购管理'
  }, {
    className: '',
    icon: home_section6_3svg.src,
    text: '账单管理'
  }, {
    className: 'mt-20',
    icon: home_section6_4svg.src,
    text: '客户订单'
  }, {
    className: '',
    icon: home_section6_5svg.src,
    text: '快递打单'
  }];

  const data2s = [{
    className: 'mt-20',
    icon: home_section6_6svg.src,
    backgroundColor: '#864fb1',
    text: '出库入库'
  }, {
    className: '',
    icon: home_section6_7svg.src,
    backgroundColor: '#864fb1',
    text: '库内操作'
  }, {
    className: 'mt-20',
    icon: home_section6_8svg.src,
    backgroundColor: '#864fb1',
    text: 'PDA'
  }, {
    className: '',
    icon: home_section6_9svg.src,
    backgroundColor: '#864fb1',
    text: '仓库管理'
  }, {
    className: 'mt-20',
    icon: home_section6_10svg.src,
    backgroundColor: '#864fb1',
    text: '各类报表'
  }]

  return <div>
    <div className='h-20 pt-4 pb-4 flex gap-4 items-center justify-center'>
      <img className='h-full' src="/logo.png" alt="ice" />
      <h1 className='font-semibold text-3xl text-transparent bg-clip-text'
        style={{
          background: 'linear-gradient(to right,#b84297,#6457c1)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text'
        }}
      >小冰助手</h1>
    </div>
    <p className='mt-4 text-gray-500 text-center'>来看看我们的提供的主要功能吧，当然，我们不止这些功能</p>
    <div className='w-full flex flex-wrap lg:flex-nowrap gap:8 lg:gap-16'>
      <div className='w-full lg:w-1/2 flex justify-between mt-8'>
        {data1s.map((item, index) => <Section6Item key={index} {...item} />)}
      </div>
      <div className='w-full lg:w-1/2 flex justify-between mt-8'>
        {data2s.map((item, index) => <Section6Item key={index} {...item} />)}
      </div>
    </div>
  </div>
}

export default function Home() {
  return (
    <>
      <Head>
        <title>小冰</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className='mt-32'>
        <div className='max-w-screen-xl ml-auto mr-auto pl-4 pr-4 md:pl-8 md:pr-8'>
          <Section1 />
          <div className='h-12' />
          <Section2 />
          <div className='h-12' />
          <Section4 />
          <div className='h-12' />
          <Section5 />
        </div>
        <div className='h-12' />
        <div className='bg-white p-6'>
          <Section6 />
        </div>
        <div className='h-12' />
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
      </main>
      <Footer />
    </>
  )
}
