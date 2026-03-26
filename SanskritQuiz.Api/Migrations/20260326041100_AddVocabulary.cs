using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SanskritQuiz.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVocabulary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Vocabularies",
                columns: table => new
                {
                    SanskritWord = table.Column<string>(type: "TEXT", nullable: false),
                    EnglishWord = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vocabularies", x => new { x.SanskritWord, x.EnglishWord });
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Vocabularies");
        }
    }
}
