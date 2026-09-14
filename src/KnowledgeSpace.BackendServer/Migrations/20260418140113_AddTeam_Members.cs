using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeSpace.BackendServer.Migrations
{
    /// <inheritdoc />
    public partial class AddTeam_Members : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Teams",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Members",
                table: "Teams",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Teams_CategoryId",
                table: "Teams",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Teams_Categories_CategoryId",
                table: "Teams",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teams_Categories_CategoryId",
                table: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Teams_CategoryId",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "Members",
                table: "Teams");
        }
    }
}
