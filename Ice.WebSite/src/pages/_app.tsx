import '@/styles/globals.css'
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <DefaultSeo
      title='小冰'
      description='小冰是基于 ant v5 开发的系统，系统包含 AI客服，进销存，仓库管理。为中小微企业提供一套完整的作业流程。'
      openGraph={{
        type: 'website',
        locale: 'zh-cn',
        url: 'https://www.bittyice.cn/',
        siteName: '小冰',
      }}
      twitter={{
        handle: '@handle',
        site: '@site',
        cardType: 'summary_large_image',
      }}
    />
    <Component {...pageProps} />
  </>
}
