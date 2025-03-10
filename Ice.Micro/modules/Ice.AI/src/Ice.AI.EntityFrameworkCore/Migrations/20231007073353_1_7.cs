using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ice.AI.Migrations
{
    /// <inheritdoc />
    public partial class _17 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Ip",
                table: "AIQuestionnaireResult",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "AIQuestionnaireResult",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "TagName",
                table: "AIQuestionnaireResult",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ClientGuideQuestionText",
                table: "AIGpt",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ClientNoResponseText",
                table: "AIGpt",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ClientNoResponseTime",
                table: "AIGpt",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AIQaTag",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIQaTag", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_AIQuestionnaireResult_TagName",
                table: "AIQuestionnaireResult",
                column: "TagName");

            migrationBuilder.CreateIndex(
                name: "IX_AIQaTag_TenantId",
                table: "AIQaTag",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AIQaTag");

            migrationBuilder.DropIndex(
                name: "IX_AIQuestionnaireResult_TagName",
                table: "AIQuestionnaireResult");

            migrationBuilder.DropColumn(
                name: "Ip",
                table: "AIQuestionnaireResult");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "AIQuestionnaireResult");

            migrationBuilder.DropColumn(
                name: "TagName",
                table: "AIQuestionnaireResult");

            migrationBuilder.DropColumn(
                name: "ClientGuideQuestionText",
                table: "AIGpt");

            migrationBuilder.DropColumn(
                name: "ClientNoResponseText",
                table: "AIGpt");

            migrationBuilder.DropColumn(
                name: "ClientNoResponseTime",
                table: "AIGpt");
        }
    }
}
