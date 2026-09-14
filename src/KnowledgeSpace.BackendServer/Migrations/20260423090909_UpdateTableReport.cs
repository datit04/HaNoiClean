using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeSpace.BackendServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiConfidence",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "AiSuggestedCategoryId",
                table: "Reports");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AiConfidence",
                table: "Reports",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AiSuggestedCategoryId",
                table: "Reports",
                type: "int",
                nullable: true);
        }
    }
}
