using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanskritQuiz.Api.Data;
using SanskritQuiz.Api.Models;

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
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
