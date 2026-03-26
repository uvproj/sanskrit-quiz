using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanskritQuiz.Api.Data;
using SanskritQuiz.Api.Models;
using System.Linq;
using System.Threading.Tasks;

namespace SanskritQuiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            // Simple string matching. Password hashing could be implemented later.
            var admin = await _context.AdminUsers.FirstOrDefaultAsync(a => a.Username == login.Username && a.PasswordHash == login.Password);
            if (admin == null)
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(new { token = "fake-jwt-token", message = "Login successful" });
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessions()
        {
            var sessions = await _context.Sessions
                .OrderByDescending(s => s.DateAndTime)
                .ToListAsync();
            return Ok(sessions);
        }

        [HttpGet("sessions/{sessionId}/performances")]
        public async Task<IActionResult> GetPerformances(string sessionId)
        {
            var performances = await _context.UserPerformances
                .Include(p => p.Question)
                .ThenInclude(q => q.Options)
                .Where(p => p.SessionId == sessionId)
                .ToListAsync();
            return Ok(performances);
        }

        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions()
        {
            var questions = await _context.Questions.Include(q => q.Options).ToListAsync();
            return Ok(questions);
        }

        [HttpPost("questions")]
        public async Task<IActionResult> AddQuestion([FromBody] Question question)
        {
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();
            return Ok(question);
        }

        [HttpGet("media")]
        public async Task<IActionResult> GetMediaFiles()
        {
            var files = await _context.MediaFiles
                .Select(m => new { m.Id, m.FileName, m.ContentType, m.Tags })
                .ToListAsync();
            return Ok(files);
        }

        [HttpGet("media/{id}")]
        public async Task<IActionResult> GetMediaFile(int id)
        {
            var file = await _context.MediaFiles.FindAsync(id);
            if (file == null) return NotFound();
            return File(file.Content, file.ContentType, file.FileName);
        }

        [HttpPost("media")]
        public async Task<IActionResult> UploadMedia([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string tags = "")
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            using var memoryStream = new System.IO.MemoryStream();
            await file.CopyToAsync(memoryStream);

            var mediaFile = new MediaFile
            {
                FileName = file.FileName,
                ContentType = file.ContentType,
                Content = memoryStream.ToArray(),
                Tags = tags ?? string.Empty
            };

            _context.MediaFiles.Add(mediaFile);
            await _context.SaveChangesAsync();

            return Ok(new { mediaFile.Id, mediaFile.FileName, mediaFile.ContentType, mediaFile.Tags });
        }

        [HttpDelete("media/{id}")]
        public async Task<IActionResult> DeleteMedia(int id)
        {
            var file = await _context.MediaFiles.FindAsync(id);
            if (file == null) return NotFound();

            _context.MediaFiles.Remove(file);
            await _context.SaveChangesAsync();
            return Ok(new { message = "File deleted successfully" });
        }
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
