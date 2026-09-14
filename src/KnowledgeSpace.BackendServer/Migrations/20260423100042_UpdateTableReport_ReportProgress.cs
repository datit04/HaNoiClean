using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeSpace.BackendServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableReport_ReportProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Teams_AssignedTeamId",
                table: "Reports");

            migrationBuilder.RenameColumn(
                name: "AssignedTeamId",
                table: "Reports",
                newName: "TeamId");

            migrationBuilder.RenameIndex(
                name: "IX_Reports_AssignedTeamId",
                table: "Reports",
                newName: "IX_Reports_TeamId");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ReportProgress",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Teams_TeamId",
                table: "Reports",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Teams_TeamId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "ReportProgress");

            migrationBuilder.RenameColumn(
                name: "TeamId",
                table: "Reports",
                newName: "AssignedTeamId");

            migrationBuilder.RenameIndex(
                name: "IX_Reports_TeamId",
                table: "Reports",
                newName: "IX_Reports_AssignedTeamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Teams_AssignedTeamId",
                table: "Reports",
                column: "AssignedTeamId",
                principalTable: "Teams",
                principalColumn: "Id");
        }
    }
}
