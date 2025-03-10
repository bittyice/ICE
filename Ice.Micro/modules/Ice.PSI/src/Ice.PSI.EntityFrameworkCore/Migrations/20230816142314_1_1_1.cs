using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ice.PSI.Migrations
{
    /// <inheritdoc />
    public partial class _111 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_PSISaleReturnOrder_FinishDate",
                table: "PSISaleReturnOrder",
                column: "FinishDate");

            migrationBuilder.CreateIndex(
                name: "IX_PSISaleOrder_FinishDate",
                table: "PSISaleOrder",
                column: "FinishDate");

            migrationBuilder.CreateIndex(
                name: "IX_PSIPurchaseReturnOrder_FinishDate",
                table: "PSIPurchaseReturnOrder",
                column: "FinishDate");

            migrationBuilder.CreateIndex(
                name: "IX_PSIPurchaseOrder_FinishDate",
                table: "PSIPurchaseOrder",
                column: "FinishDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PSISaleReturnOrder_FinishDate",
                table: "PSISaleReturnOrder");

            migrationBuilder.DropIndex(
                name: "IX_PSISaleOrder_FinishDate",
                table: "PSISaleOrder");

            migrationBuilder.DropIndex(
                name: "IX_PSIPurchaseReturnOrder_FinishDate",
                table: "PSIPurchaseReturnOrder");

            migrationBuilder.DropIndex(
                name: "IX_PSIPurchaseOrder_FinishDate",
                table: "PSIPurchaseOrder");
        }
    }
}
