import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { NextSeo } from 'next-seo';

const datas = [
    { href: 'ai', text: 'AI客服', des: '本片文章介绍如何使用我们的AI客服，跟着文章的操作，带你了解整个流程' },
    { href: 'psi', text: '进销存', des: '本片文章介绍如何使用我们的进销存，跟着文章的操作，带你了解整个流程' },
    { href: 'wms', text: '仓库管理', des: '本片文章介绍如何使用我们的仓库管理，跟着文章的操作，带你了解整个流程' },
    { href: 'wmspda', text: '仓库管理-PDA', des: '本片文章介绍如何使用我们的PDA程序，跟着文章的操作，带你了解整个流程' },
]

export default function Home() {
    const router = useRouter();
    const selectDataIndex = datas.findIndex(e => e.href == router.query.page);
    const selectData = selectDataIndex >= 0 ? datas[selectDataIndex] : undefined;
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NextSeo
                title={`小冰-${selectData?.text}文档`}
                description={`小冰文档-${selectData?.des}`}
            />
            <div className='flex flex-col'>
                <div className='h-screen flex flex-col'>
                    <Header />
                    <div className='h-32 mb-2'></div>
                    <main className='flex-grow'>
                        <div className='container max-w-screen-xl ml-auto mr-auto h-full pl-4 pr-4'>
                            <div className='w-full flex-col md:flex-row flex h-full'>
                                <div className='hidden md:flex w-2/12 flex-col gap-1 pt-2 bg-slate-800 rounded-l-lg'
                                    style={{
                                    }}
                                >
                                    {
                                        datas.map((item, index) => (
                                            <Link key={index} className='pt-3 pb-3 pl-6 pr-6' href={`/docs/${item.href}`}
                                                style={{
                                                    backgroundColor: router.query.page == item.href ? '#b84297' : '#5447b1',
                                                    color: '#fff',
                                                }}
                                            >{item.text}</Link>
                                        ))
                                    }
                                </div>
                                <div className='w-full md:w-10/12 h-full'>
                                    <embed src={`/docfiles/${router.query.page}.pdf`} type="application/pdf" width="100%" height="100%" />
                                </div>
                                <div className='flex md:hidden p-4'>
                                    <a href="javascript:void(0)"
                                        onClick={() => {
                                            if (selectDataIndex > 0) {
                                                router.push(`/docs/${datas[selectDataIndex - 1].href}`);
                                            }
                                        }}
                                    >上一篇</a>
                                    <div className='flex-grow text-center text-gray-500'>{selectData?.text}</div>
                                    <a href="javascript:void(0)"
                                        onClick={() => {
                                            if (selectDataIndex < (datas.length - 1)) {
                                                router.push(`/docs/${datas[selectDataIndex + 1].href}`)
                                            }
                                        }}
                                    >下一篇</a>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        </>
    )
}
