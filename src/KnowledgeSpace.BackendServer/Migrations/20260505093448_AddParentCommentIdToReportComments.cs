using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeSpace.BackendServer.Migrations
{
    /// <inheritdoc />
    public partial class AddParentCommentIdToReportComments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "ParentCommentId",
                table: "ReportComments",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportComments_ParentCommentId",
                table: "ReportComments",
                column: "ParentCommentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReportComments_ReportComments_ParentCommentId",
                table: "ReportComments",
                column: "ParentCommentId",
                principalTable: "ReportComments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReportComments_ReportComments_ParentCommentId",
                table: "ReportComments");

            migrationBuilder.DropIndex(
                name: "IX_ReportComments_ParentCommentId",
                table: "ReportComments");

            migrationBuilder.DropColumn(
                name: "ParentCommentId",
                table: "ReportComments");
        }
    }
}
