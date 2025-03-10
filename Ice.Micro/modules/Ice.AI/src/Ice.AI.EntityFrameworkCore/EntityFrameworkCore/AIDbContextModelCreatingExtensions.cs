using Ice.AI.Core;
using Ice.Utils;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Ice.AI.EntityFrameworkCore;

public static class AIDbContextModelCreatingExtensions
{
    public static void ConfigureAI(
        this ModelBuilder builder)
    {
        Check.NotNull(builder, nameof(builder));

        /* Configure all entities here. Example:

        builder.Entity<Question>(b =>
        {
            //Configure table & schema name
            b.ToTable(AIDbProperties.DbTablePrefix + "Questions", AIDbProperties.DbSchema);

            b.ConfigureByConvention();

            //Properties
            b.Property(q => q.Title).IsRequired().HasMaxLength(QuestionConsts.MaxTitleLength);

            //Relations
            b.HasMany(question => question.Tags).WithOne().HasForeignKey(qt => qt.QuestionId);

            //Indexes
            b.HasIndex(q => q.CreationTime);
        });
        */

        builder.Entity<Gpt>(b => {
            b.ToTable(AIDbProperties.DbTablePrefix + "Gpt", AIDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(u => u.ChatWelcomeText).HasMaxLength(Consts.Length128);
            b.Property(u => u.QaWelcomeText).HasMaxLength(Consts.Length128);
            b.Property(u => u.ClientNoResponseText).HasMaxLength(Consts.MediumTextLength);
            b.Property(u => u.ClientGuideQuestionText).HasMaxLength(Consts.LargerTextLength);
            b.Property(u => u.ContactBoxSpanTime).HasDefaultValue(-1);

            b.HasIndex(e => e.TenantId).IsUnique(true);
        });

        builder.Entity<Questionnaire>(b => {
            b.ToTable(AIDbProperties.DbTablePrefix + "Questionnaire", AIDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(u => u.Question).HasMaxLength(Consts.MinTextLength);

            b.HasIndex(e => e.TenantId);
        });

        builder.Entity<QuestionnaireResult>(b => {
            b.ToTable(AIDbProperties.DbTablePrefix + "QuestionnaireResult", AIDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(u => u.GuestName).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.Phone).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.Email).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.TagName).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.Ip).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.Province).HasMaxLength(Consts.MinTextLength);

            b.HasIndex(e => e.CreationTime);
            b.HasIndex(e => e.TenantId);
            b.HasIndex(e => e.TagName);
        });

        builder.Entity<QaTag>(b => {
            b.ToTable(AIDbProperties.DbTablePrefix + "QaTag", AIDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(u => u.Name).IsRequired().HasMaxLength(Consts.MinTextLength);

            b.HasIndex(e => e.TenantId);
        });

        builder.Entity<CsText>(b => {
            b.ToTable(AIDbProperties.DbTablePrefix + "CsText", AIDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(u => u.GroupName).IsRequired().HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.TextList).IsRequired().HasMaxLength(Consts.MaxTextLength);

            b.HasIndex(e => e.TenantId);
        });

        builder.Entity<Client>(b => {
            b.ToTable(AIDbProperties.DbTablePrefix + "Client", AIDbProperties.DbSchema);
            b.ConfigureByConvention();

            b.Property(u => u.Name).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.Phone).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.Email).HasMaxLength(Consts.MinTextLength);
            b.Property(u => u.Intention).IsRequired().HasMaxLength(Consts.MinTextLength);

            b.HasIndex(e => e.TenantId);
            b.HasIndex(e => e.CreationTime);
        });
    }
}
