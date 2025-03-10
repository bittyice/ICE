import wxgzhimg from '@/statics/images/wxgzh.jpg';
import wxsvg from '@/statics/icons/wx.svg';
import phonesvg from '@/statics/icons/phone.svg';
import emailsvg from '@/statics/icons/email.svg';

export default (props: {}) => {
    return <footer id="footer">
        <div className='container max-w-screen-xl ml-auto mr-auto pt-10 pb-10 flex pl-4 pr-4'>
            <div className='w-full sm:w-2/3 lg:w-1/3'>
                <div className='h-10 flex gap-4 items-center'>
                    <img className='h-full' src="/logo.png" alt="ice" />
                    <h1 className='font-semibold text-3xl text-transparent bg-clip-text'
                        style={{
                            background: 'linear-gradient(to right,#b84297,#6457c1)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text'
                        }}
                    >ICEEMBLEM</h1>
                </div>
                <div className='flex flex-col gap-2 mt-6 ml-2 text-gray-500'>
                    <div className='flex gap-2'><img className='w-6' src={wxsvg.src} /><span>微信：13637513897</span></div>
                    <div className='flex gap-2'><img className='w-6' src={phonesvg.src} /><span>电话：13637513897</span></div>
                    <div className='flex gap-2'><img className='w-6' src={emailsvg.src} /><span>邮箱：136375138978@163.com</span></div>
                </div>
            </div>
            <div className='w-1/3 hidden lg:block'>
                <h3 className='h-10 flex items-center text-2xl font-semibold' style={{ color: '#b54298' }}>海南鲸浩科技有限公司</h3>
                <p className='mt-4 text-gray-500' style={{ lineHeight: '26px' }}>公司成立于2021年7月，致力于服务中小型企业，降低中小企业的用人成本，规范操作流畅，提高企业的运行效率，减少人工犯错，提高企业的利润。</p>
            </div>
            <div className='flex-grow'></div>
            <div className='hidden sm:block'>
                <img className='w-32' src={wxgzhimg.src} alt="" />
                <p className='text-center text-gray-500'>公众号</p>
            </div>
        </div>
        <div className='text-sm md:text-base text-center text-gray-800 p-4 bg-white'>
            <span>Copyright @IceEmblem All rights reserved</span>
            <span className='ml-4 mr-4'>|</span>
            <a href="https://beian.miit.gov.cn/" target="_blank">琼ICP备2023004722号-1</a>
        </div>
    </footer>
}