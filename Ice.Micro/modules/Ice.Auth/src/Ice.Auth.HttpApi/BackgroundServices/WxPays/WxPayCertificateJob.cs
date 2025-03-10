using System.Threading.Tasks;
using Ice.Auth.Services.Pays;
using Ice.Auth.Services.Wxs;
using Quartz;
using Volo.Abp.DependencyInjection;

namespace Ice.Auth.BackgroundServices.WxPays
{
    public class WxPayCertificateJob : IJob, ITransientDependency
    {
        public WxPayCertificateJob()
        {
        }

        public async Task Execute(IJobExecutionContext context)
        {
            await WxPayHelper.FetchPayCertificate();
        }
    }
}
