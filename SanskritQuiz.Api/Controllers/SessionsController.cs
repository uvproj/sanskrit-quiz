using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanskritQuiz.Api.Data;
using SanskritQuiz.Api.Models;
using System;
using System.Threading.Tasks;

namespace SanskritQuiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SessionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet()]
        public async Task<IActionResult> GetSessions()
        {
            var sessions = await _context.Sessions
                .OrderByDescending(s => s.DateAndTime)
                .ToListAsync();
            return Ok(sessions);
        }


        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetSession(string sessionId)
        {
            var session = await _context.Sessions.FindAsync(sessionId);
            if (session == null) return NotFound("Session not found.");
            return Ok(session);
        }


        [HttpPost]
        public async Task<IActionResult> CreateSession([FromBody] CreateSessionDto dto)
        {
            var session = new Session
            {
                Id = $"{dto.UserName.Replace(" ", "")}_{DateTime.UtcNow:yyyyMMddHHmmss}",
                UserName = dto.UserName,
                Mode = dto.Mode,
                DateAndTime = DateTime.UtcNow,
                NumberOfQuestions = dto.NumberOfQuestions
            };

            _context.Sessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok(new { sessionId = session.Id });
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteSession(string id, [FromBody] CompleteSessionDto dto)
        {
            var session = await _context.Sessions.FindAsync(id);
            if (session == null) return NotFound("Session not found.");

            session.Score = dto.Score;
            session.CorrectAnswers = dto.CorrectAnswers;
            session.UnansweredAnswers = dto.UnansweredAnswers;

            foreach (var perf in dto.Performances)
            {
                var performance = new UserPerformance
                {
                    SessionId = session.Id,
                    QuestionId = perf.QuestionId,
                    SelectedOptionId = perf.SelectedOptionId,
                    CorrectOptionId = perf.CorrectOptionId,
                    TimeTaken = perf.TimeTaken,
                    IsCorrect = perf.IsCorrect,
                    IsUnanswered = perf.IsUnanswered
                };
                _context.UserPerformances.Add(performance);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{sessionId}/performances")]
        public async Task<IActionResult> GetPerformances(string sessionId)
        {
            var performances = await _context.UserPerformances
                .Include(p => p.Question)
                .ThenInclude(q => q.Options)
                .Where(p => p.SessionId == sessionId)
                .ToListAsync();
            return Ok(performances);
        }

    }

    public class CreateSessionDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Mode { get; set; } = string.Empty;
        public int NumberOfQuestions { get; set; }
    }

    public class CompleteSessionDto
    {
        public int Score { get; set; }
        public int CorrectAnswers { get; set; }
        public int UnansweredAnswers { get; set; }
        public System.Collections.Generic.List<PerformanceDto> Performances { get; set; } = new();
    }

    public class PerformanceDto
    {
        public int QuestionId { get; set; }
        public int? SelectedOptionId { get; set; }
        public int CorrectOptionId { get; set; }
        public int TimeTaken { get; set; }
        public bool IsCorrect { get; set; }
        public bool IsUnanswered { get; set; }
    }
}
