using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SanskritQuiz.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SanskritQuiz.Api.Data
{
    public static class DbSeeder
    {
        public static void Seed(IServiceProvider serviceProvider)
        {
            using var context = new AppDbContext(serviceProvider.GetRequiredService<DbContextOptions<AppDbContext>>());
            context.Database.Migrate();

            if (!context.AdminUsers.Any())
            {
                context.AdminUsers.Add(new AdminUser { Username = "admin", PasswordHash = "password123" });
            }

            if (!context.Questions.Any())
            {
                // Add some sample questions
                var q1 = new Question { Type = "Word", Content = "Gaja (गज)" };
                q1.Options = new List<Option>
                {
                    new Option { Type = "Word", Content = "Elephant", IsCorrect = true },
                    new Option { Type = "Word", Content = "Horse", IsCorrect = false },
                    new Option { Type = "Word", Content = "Lion", IsCorrect = false },
                    new Option { Type = "Word", Content = "Tiger", IsCorrect = false }
                };

                var q2 = new Question { Type = "Word", Content = "Ashva (अश्व)" };
                q2.Options = new List<Option>
                {
                    new Option { Type = "Word", Content = "Elephant", IsCorrect = false },
                    new Option { Type = "Word", Content = "Horse", IsCorrect = true },
                    new Option { Type = "Word", Content = "Lion", IsCorrect = false },
                    new Option { Type = "Word", Content = "Tiger", IsCorrect = false }
                };

                var q3 = new Question { Type = "Word", Content = "Simha (सिंह)" };
                q3.Options = new List<Option>
                {
                    new Option { Type = "Word", Content = "Elephant", IsCorrect = false },
                    new Option { Type = "Word", Content = "Horse", IsCorrect = false },
                    new Option { Type = "Word", Content = "Lion", IsCorrect = true },
                    new Option { Type = "Word", Content = "Tiger", IsCorrect = false }
                };

                context.Questions.AddRange(q1, q2, q3);
            }

            context.SaveChanges();
        }
    }
}
