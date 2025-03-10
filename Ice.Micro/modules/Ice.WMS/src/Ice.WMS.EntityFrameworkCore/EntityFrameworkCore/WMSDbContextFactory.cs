using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Ice.WMS.EntityFrameworkCore;

public class WMSDbContextFactory : IDesignTimeDbContextFactory<WMSDbContext>
{
    public WMSDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();

        var builder = new DbContextOptionsBuilder<WMSDbContext>()
            .UseMySql(configuration.GetConnectionString(WMSDbProperties.ConnectionStringName), Microsoft.EntityFrameworkCore.MySqlServerVersion.Parse("5.7.39"));

        return new WMSDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
