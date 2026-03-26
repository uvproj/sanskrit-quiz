using Microsoft.EntityFrameworkCore;
using SanskritQuiz.Api.Models;

namespace SanskritQuiz.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<AdminUser> AdminUsers { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<UserPerformance> UserPerformances { get; set; }
        public DbSet<MediaFile> MediaFiles { get; set; }
    }
}
