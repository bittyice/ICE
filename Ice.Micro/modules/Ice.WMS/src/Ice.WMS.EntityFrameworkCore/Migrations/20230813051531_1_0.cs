using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ice.WMS.Migrations
{
    /// <inheritdoc />
    public partial class _10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSStockChangeLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RelationId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Sku = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSStockChangeLog", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSWarehouse",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Code = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContactNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Province = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    City = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Town = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Street = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AddressDetail = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Postcode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Principal = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Remark = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    EnableInboundBatch = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatorId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LastModificationTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DeletionTime = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSWarehouse", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSWarehouseTransfer",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TransferNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OriginWarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    OutboundOrderId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DestinationWarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    InboundOrderId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatorId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSWarehouseTransfer", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSArea",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Code = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LastCheckTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    AllowSpecifications = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ForbidSpecifications = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    Remark = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSArea", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSArea_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSInboundOrder",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    InboundNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InboundBatch = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Type = table.Column<int>(type: "int", nullable: false, defaultValue: 999),
                    Status = table.Column<int>(type: "int", nullable: false),
                    FinishTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Remark = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExtraInfo = table.Column<string>(type: "varchar(8000)", maxLength: 8000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherInfo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatorId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LastModificationTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DeletionTime = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSInboundOrder", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSInboundOrder_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSInventoryAlert",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Sku = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatorId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSInventoryAlert", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSInventoryAlert_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSLossReportOrder",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    OrderNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ExtraInfo = table.Column<string>(type: "varchar(8000)", maxLength: 8000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatorId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LastModificationTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DeletionTime = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSLossReportOrder", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSLossReportOrder_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSPickList",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    PickListNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OrderCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DeletionTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSPickList", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSPickList_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSTransferSku",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Sku = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InboundBatch = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ShelfLise = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSTransferSku", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSTransferSku_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSWarehouseMessage",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Title = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Message = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Readed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ReadId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSWarehouseMessage", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSWarehouseMessage_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSLocation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Code = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Often = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    AreaId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSLocation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSLocation_WMSArea_AreaId",
                        column: x => x.AreaId,
                        principalTable: "WMSArea",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WMSLocation_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSWarehouseCheck",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Executor = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CheckStartTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CheckFinishTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatorId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    AreaId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSWarehouseCheck", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSWarehouseCheck_WMSArea_AreaId",
                        column: x => x.AreaId,
                        principalTable: "WMSArea",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WMSWarehouseCheck_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSInboundDetail",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Sku = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ForecastQuantity = table.Column<int>(type: "int", nullable: false),
                    ActualQuantity = table.Column<int>(type: "int", nullable: false),
                    ShelvesQuantity = table.Column<int>(type: "int", nullable: false),
                    ShelfLise = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Remark = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TotalAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    InboundOrderId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSInboundDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSInboundDetail_WMSInboundOrder_InboundOrderId",
                        column: x => x.InboundOrderId,
                        principalTable: "WMSInboundOrder",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSLossReportDetail",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Sku = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    LossReportOrderId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSLossReportDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSLossReportDetail_WMSLossReportOrder_LossReportOrderId",
                        column: x => x.LossReportOrderId,
                        principalTable: "WMSLossReportOrder",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSOutboundOrder",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    OutboundNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecvContact = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecvContactNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecvProvince = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecvCity = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecvTown = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecvStreet = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecvAddressDetail = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecvPostcode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Reviewed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    WarehouseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    OrderType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false, defaultValue: "Customize")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FinishTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Remark = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExtraInfo = table.Column<string>(type: "varchar(8000)", maxLength: 8000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherInfo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PickListId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    IsPushTMS = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExtraProperties = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConcurrencyStamp = table.Column<string>(type: "varchar(40)", maxLength: 40, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreationTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatorId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LastModificationTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DeletionTime = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSOutboundOrder", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSOutboundOrder_WMSPickList_PickListId",
                        column: x => x.PickListId,
                        principalTable: "WMSPickList",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WMSOutboundOrder_WMSWarehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "WMSWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSLocationDetail",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Sku = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InboundBatch = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ShelfLise = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsFreeze = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    LocationId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSLocationDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSLocationDetail_WMSLocation_LocationId",
                        column: x => x.LocationId,
                        principalTable: "WMSLocation",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WMSOutboundDetail",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Sku = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    SortedQuantity = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    OutboundOrderId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WMSOutboundDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WMSOutboundDetail_WMSOutboundOrder_OutboundOrderId",
                        column: x => x.OutboundOrderId,
                        principalTable: "WMSOutboundOrder",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_WMSArea_Code",
                table: "WMSArea",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_WMSArea_WarehouseId",
                table: "WMSArea",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundDetail_InboundOrderId",
                table: "WMSInboundDetail",
                column: "InboundOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_CreationTime",
                table: "WMSInboundOrder",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_FinishTime",
                table: "WMSInboundOrder",
                column: "FinishTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_InboundBatch",
                table: "WMSInboundOrder",
                column: "InboundBatch");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_InboundNumber",
                table: "WMSInboundOrder",
                column: "InboundNumber");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_IsDeleted",
                table: "WMSInboundOrder",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_Status",
                table: "WMSInboundOrder",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_TenantId",
                table: "WMSInboundOrder",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_Type",
                table: "WMSInboundOrder",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInboundOrder_WarehouseId",
                table: "WMSInboundOrder",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInventoryAlert_CreationTime",
                table: "WMSInventoryAlert",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInventoryAlert_CreatorId",
                table: "WMSInventoryAlert",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInventoryAlert_Sku",
                table: "WMSInventoryAlert",
                column: "Sku");

            migrationBuilder.CreateIndex(
                name: "IX_WMSInventoryAlert_WarehouseId",
                table: "WMSInventoryAlert",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocation_AreaId",
                table: "WMSLocation",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocation_Code",
                table: "WMSLocation",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocation_IsDeleted",
                table: "WMSLocation",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocation_WarehouseId",
                table: "WMSLocation",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocationDetail_InboundBatch",
                table: "WMSLocationDetail",
                column: "InboundBatch");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocationDetail_IsFreeze",
                table: "WMSLocationDetail",
                column: "IsFreeze");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocationDetail_LocationId",
                table: "WMSLocationDetail",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocationDetail_ShelfLise",
                table: "WMSLocationDetail",
                column: "ShelfLise");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocationDetail_Sku",
                table: "WMSLocationDetail",
                column: "Sku");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLocationDetail_TenantId",
                table: "WMSLocationDetail",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLossReportDetail_LossReportOrderId",
                table: "WMSLossReportDetail",
                column: "LossReportOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLossReportOrder_CreationTime",
                table: "WMSLossReportOrder",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLossReportOrder_IsDeleted",
                table: "WMSLossReportOrder",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLossReportOrder_OrderNumber",
                table: "WMSLossReportOrder",
                column: "OrderNumber");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLossReportOrder_Status",
                table: "WMSLossReportOrder",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WMSLossReportOrder_WarehouseId",
                table: "WMSLossReportOrder",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundDetail_OutboundOrderId",
                table: "WMSOutboundDetail",
                column: "OutboundOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_CreationTime",
                table: "WMSOutboundOrder",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_FinishTime",
                table: "WMSOutboundOrder",
                column: "FinishTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_IsDeleted",
                table: "WMSOutboundOrder",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_OrderType",
                table: "WMSOutboundOrder",
                column: "OrderType");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_OutboundNumber",
                table: "WMSOutboundOrder",
                column: "OutboundNumber");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_PickListId",
                table: "WMSOutboundOrder",
                column: "PickListId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_RecvContact",
                table: "WMSOutboundOrder",
                column: "RecvContact");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_RecvContactNumber",
                table: "WMSOutboundOrder",
                column: "RecvContactNumber");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_Status",
                table: "WMSOutboundOrder",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_TenantId",
                table: "WMSOutboundOrder",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSOutboundOrder_WarehouseId",
                table: "WMSOutboundOrder",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSPickList_CreationTime",
                table: "WMSPickList",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSPickList_IsDeleted",
                table: "WMSPickList",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_WMSPickList_PickListNumber",
                table: "WMSPickList",
                column: "PickListNumber");

            migrationBuilder.CreateIndex(
                name: "IX_WMSPickList_Status",
                table: "WMSPickList",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WMSPickList_WarehouseId",
                table: "WMSPickList",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSStockChangeLog_RelationId",
                table: "WMSStockChangeLog",
                column: "RelationId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSStockChangeLog_TenantId",
                table: "WMSStockChangeLog",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSStockChangeLog_WarehouseId",
                table: "WMSStockChangeLog",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSTransferSku_Sku",
                table: "WMSTransferSku",
                column: "Sku");

            migrationBuilder.CreateIndex(
                name: "IX_WMSTransferSku_WarehouseId",
                table: "WMSTransferSku",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouse_Code",
                table: "WMSWarehouse",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouse_CreationTime",
                table: "WMSWarehouse",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouse_Name",
                table: "WMSWarehouse",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouse_TenantId",
                table: "WMSWarehouse",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseCheck_AreaId",
                table: "WMSWarehouseCheck",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseCheck_CreationTime",
                table: "WMSWarehouseCheck",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseCheck_Executor",
                table: "WMSWarehouseCheck",
                column: "Executor");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseCheck_Status",
                table: "WMSWarehouseCheck",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseCheck_WarehouseId",
                table: "WMSWarehouseCheck",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseMessage_CreationTime",
                table: "WMSWarehouseMessage",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseMessage_Title",
                table: "WMSWarehouseMessage",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseMessage_WarehouseId",
                table: "WMSWarehouseMessage",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseTransfer_CreationTime",
                table: "WMSWarehouseTransfer",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseTransfer_DestinationWarehouseId",
                table: "WMSWarehouseTransfer",
                column: "DestinationWarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseTransfer_InboundOrderId",
                table: "WMSWarehouseTransfer",
                column: "InboundOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseTransfer_OriginWarehouseId",
                table: "WMSWarehouseTransfer",
                column: "OriginWarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseTransfer_OutboundOrderId",
                table: "WMSWarehouseTransfer",
                column: "OutboundOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseTransfer_TenantId",
                table: "WMSWarehouseTransfer",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WMSWarehouseTransfer_TransferNumber",
                table: "WMSWarehouseTransfer",
                column: "TransferNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WMSInboundDetail");

            migrationBuilder.DropTable(
                name: "WMSInventoryAlert");

            migrationBuilder.DropTable(
                name: "WMSLocationDetail");

            migrationBuilder.DropTable(
                name: "WMSLossReportDetail");

            migrationBuilder.DropTable(
                name: "WMSOutboundDetail");

            migrationBuilder.DropTable(
                name: "WMSStockChangeLog");

            migrationBuilder.DropTable(
                name: "WMSTransferSku");

            migrationBuilder.DropTable(
                name: "WMSWarehouseCheck");

            migrationBuilder.DropTable(
                name: "WMSWarehouseMessage");

            migrationBuilder.DropTable(
                name: "WMSWarehouseTransfer");

            migrationBuilder.DropTable(
                name: "WMSInboundOrder");

            migrationBuilder.DropTable(
                name: "WMSLocation");

            migrationBuilder.DropTable(
                name: "WMSLossReportOrder");

            migrationBuilder.DropTable(
                name: "WMSOutboundOrder");

            migrationBuilder.DropTable(
                name: "WMSArea");

            migrationBuilder.DropTable(
                name: "WMSPickList");

            migrationBuilder.DropTable(
                name: "WMSWarehouse");
        }
    }
}
