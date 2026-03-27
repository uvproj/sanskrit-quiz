using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanskritQuiz.Api.Data;
using SanskritQuiz.Api.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SanskritQuiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizzesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizzesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetQuestions([FromQuery] int count = 10)
        {
            var questions = await _context.Questions
                .Include(q => q.Options)
                .Take(count)
                .ToListAsync();

            if (!questions.Any())
                return NotFound(new { message = "No questions available." });

            return Ok(questions);
        }

        [HttpGet("vocabulary")]
        public async Task<IActionResult> GetVocabularyQuestions([FromQuery] int count = 10, [FromQuery] string tag = "")
        {
            var vocabularies = await _context.Vocabularies
                .Where(v => string.IsNullOrEmpty(tag) || v.Tags.ToLower().Contains(tag.ToLower()))
                .Take(count)
                .ToListAsync();

            if (vocabularies.Count == 0)
                return NotFound(new { message = "No vocabularies available to generate questions." });

            var questions = vocabularies.Select(v => new Question
            {
                Content = v.SanskritWord,
                Options = new List<Option>
                {
                    new Option { Content = v.EnglishWord, IsCorrect = true },
                    new Option { Content = v.EnglishWord, IsCorrect = false },
                    new Option { Content = v.EnglishWord, IsCorrect = false },
                    new Option { Content = v.EnglishWord, IsCorrect = false }
                }
            }).ToList();

            return Ok(questions);
        }
    }
}
