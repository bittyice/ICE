using Ice.AI.Core;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace Ice.AI.EntityFrameworkCore;

[ConnectionStringName(AIDbProperties.ConnectionStringName)]
public class AIDbContext : AbpDbContext<AIDbContext>, IAIDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * public DbSet<Question> Questions { get; set; }
     */

    public AIDbContext(DbContextOptions<AIDbContext> options)
        : base(options)
    {

    }

    public DbSet<Gpt> Gpts { get; set; }

    public DbSet<Questionnaire> Questionnaires { get; set; }

    public DbSet<QuestionnaireResult> QuestionnaireResults { get; set; }

    public DbSet<QaTag> QaTags { get; set; }

    public DbSet<CsText> CsTexts { get; set; }

    public DbSet<Client> Clients { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ConfigureAI();
    }
}
