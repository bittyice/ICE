using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ice.PSI.Migrations
{
    /// <inheritdoc />
    public partial class _15 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PaymentMethodId",
                table: "PSISaleReturnOrder",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "PaymentMethodId",
                table: "PSISaleOrder",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "PaymentMethodId",
                table: "PSIPurchaseReturnOrder",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "PaymentMethodId",
                table: "PSIPurchaseOrder",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateTable(
                name: "PSIPaymentMethod",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CardNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Describe = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PSIPaymentMethod", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PSISaleReturnOrder_PaymentMethodId",
                table: "PSISaleReturnOrder",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_PSISaleOrder_PaymentMethodId",
                table: "PSISaleOrder",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_PSIPurchaseReturnOrder_PaymentMethodId",
                table: "PSIPurchaseReturnOrder",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_PSIPurchaseOrder_PaymentMethodId",
                table: "PSIPurchaseOrder",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_PSIPaymentMethod_Name",
                table: "PSIPaymentMethod",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PSIPaymentMethod");

            migrationBuilder.DropIndex(
                name: "IX_PSISaleReturnOrder_PaymentMethodId",
                table: "PSISaleReturnOrder");

            migrationBuilder.DropIndex(
                name: "IX_PSISaleOrder_PaymentMethodId",
                table: "PSISaleOrder");

            migrationBuilder.DropIndex(
                name: "IX_PSIPurchaseReturnOrder_PaymentMethodId",
                table: "PSIPurchaseReturnOrder");

            migrationBuilder.DropIndex(
                name: "IX_PSIPurchaseOrder_PaymentMethodId",
                table: "PSIPurchaseOrder");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "PSISaleReturnOrder");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "PSISaleOrder");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "PSIPurchaseReturnOrder");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "PSIPurchaseOrder");
        }
    }
}
