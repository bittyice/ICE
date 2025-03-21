﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ice.AI.Migrations
{
    /// <inheritdoc />
    public partial class _171 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FocusQuestion",
                table: "AIQuestionnaireResult",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FocusQuestion",
                table: "AIQuestionnaireResult");
        }
    }
}
