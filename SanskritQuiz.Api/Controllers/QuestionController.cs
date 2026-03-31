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
    public class QuestionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuestionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetQuestions([FromQuery] int? count = null)
        {
            var query = _context.Questions.Include(q => q.Options).AsQueryable();
            if (count.HasValue)
                query = query.Take(count.Value);

            var questions = await query.ToListAsync();
            return Ok(questions);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] Question updated)
        {
            var question = await _context.Questions.Include(q => q.Options).FirstOrDefaultAsync(q => q.Id == id);
            if (question == null) return NotFound();

            question.Content = updated.Content;
            question.Type = updated.Type;

            // Replace options
            _context.Options.RemoveRange(question.Options);
            question.Options = updated.Options;

            await _context.SaveChangesAsync();
            return Ok(question);
        }

        [HttpGet("vocabulary")]
        public async Task<IActionResult> GetVocabularyQuestions([FromQuery] int count = 10, [FromQuery] string tag = "")
        {
            var vocabularies = await _context.Vocabularies
                .Where(v => string.IsNullOrEmpty(tag) || v.Tags.ToLower().Contains(tag.ToLower()))
                .Take(count)
                .ToListAsync();

            if (vocabularies.Count < 4)
                return BadRequest(new { message = "Not enough vocabularies available to generate questions. Retry with different tag." });

            vocabularies = vocabularies.Shuffle().ToList();

            var allAnswerOptions = await _context.Vocabularies.Select(x => x.EnglishWord).ToListAsync();

            var questions = new List<Question>();
            foreach (var vocab in vocabularies)
            {
                var allOptions = allAnswerOptions.Except(new List<string> { vocab.EnglishWord });
                var answerOptions = Random.Shared.GetRandomItems(allOptions, 3).Append(vocab.EnglishWord).ToList();
                var shuffledAnswerOptions = answerOptions.Shuffle();

                var question = new Question
                {
                    Content = vocab.SanskritWord,
                    Type = "Word",
                    Options = new List<Option>()
                };

                foreach (var option in shuffledAnswerOptions)
                {
                    question.Options.Add(new Option { Content = option, IsCorrect = option == vocab.EnglishWord });
                }
                questions.Add(question);
            }

            return Ok(questions);
        }

        [HttpPost("")]
        public async Task<IActionResult> AddQuestion([FromBody] Question question)
        {
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();
            return Ok(question);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
            {
                return NotFound();
            }

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
