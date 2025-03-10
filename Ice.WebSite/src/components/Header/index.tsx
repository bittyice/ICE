import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router';

export default () => {
  const router = useRouter();
  const paths = [
    { pathname: '/', path: '/', text: '首页' },
    { pathname: '/ai', path: '/ai', text: 'AI客服' },
    { pathname: '/psi', path: '/psi', text: '进销存' },
    { pathname: '/wms', path: '/wms', text: '仓库管理' },
    { pathname: '/fee', path: '/fee', text: '费用' },
    { pathname: '/docs/[page]', path: '/docs/ai', text: '文档' }
  ]

  return <header className='bg-white bg-opacity-95 fixed top-0 w-full shadow-sm'>
    <div className='h-20 pl-2 pr-2 md:pl-8 md:pr-8 flex items-center' style={{ borderBottom: '1px solid #f5f5f5' }}>
      <div className='h-full pt-4 pb-4 flex gap-4 items-center'>
        <img className='h-full' src="/logo.png" alt="ice" />
        <h1 className='font-semibold text-3xl text-transparent bg-clip-text'
          style={{
            background: 'linear-gradient(to right,#b84297,#6457c1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text'
          }}
        >小冰</h1>
      </div>
      <div className='flex gap-4 ml-8 items-center'>
        <Link className={styles['header-main-btn-home']} href='/'><span>官网</span></Link>
        <Link className={`${styles['header-main-btn']} font-semibold hidden md:block`}
          href='https://www.bittyice.cn/pc/login/admin'
        ><span>后台系统</span></Link>
      </div>
      <div className='flex-grow'></div>
      <div className='hidden md:flex gap-4 ml-8 items-center'>
        <Link className={styles['header-main-btn-signup']}
          href='https://www.bittyice.cn/pc/register'
        ><span>注册</span></Link>
        <Link className={styles['header-main-btn-login']}
          href='https://www.bittyice.cn/pc/login/admin'
        ><span>登录</span></Link>
      </div>
    </div>
    <div className='container max-w-screen-xl ml-auto mr-auto md:pl-4 md:pr-4'>
      <div className='flex gap-4 pt-1 pb-1'>
        {
          paths.map((item, i) => (
            <Link key={item.pathname} className={`${styles['header-main-b-btn']} ${router.pathname == item.pathname ? styles['header-main-b-btn-active'] : ''}`} href={item.path}>
              {item.text}
            </Link>
          ))
        }
      </div>
    </div>
  </header>
}