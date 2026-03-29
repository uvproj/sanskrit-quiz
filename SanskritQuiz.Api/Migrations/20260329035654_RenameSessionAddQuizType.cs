using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SanskritQuiz.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameSessionAddQuizType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Mode",
                table: "Sessions",
                newName: "ReviewMode");

            migrationBuilder.AddColumn<string>(
                name: "QuizType",
                table: "Sessions",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuizType",
                table: "Sessions");

            migrationBuilder.RenameColumn(
                name: "ReviewMode",
                table: "Sessions",
                newName: "Mode");
        }
    }
}
