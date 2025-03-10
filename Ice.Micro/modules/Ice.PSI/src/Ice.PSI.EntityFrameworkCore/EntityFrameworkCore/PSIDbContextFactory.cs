using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Ice.PSI.EntityFrameworkCore;

public class PSIDbContextFactory : IDesignTimeDbContextFactory<PSIDbContext>
{
    public PSIDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();

        var builder = new DbContextOptionsBuilder<PSIDbContext>()
            .UseMySql(configuration.GetConnectionString("PSI"), Microsoft.EntityFrameworkCore.MySqlServerVersion.Parse("5.7.39"));

        return new PSIDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
