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
    }
}
