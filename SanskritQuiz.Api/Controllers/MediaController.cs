using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanskritQuiz.Api.Data;
using SanskritQuiz.Api.Models;

namespace SanskritQuiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MediaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMediaFiles()
        {
            var files = await _context.MediaFiles
                .Select(m => new { m.Id, m.FileName, m.ContentType, m.Tags })
                .ToListAsync();
            return Ok(files);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMediaFile(int id)
        {
            var file = await _context.MediaFiles.FindAsync(id);
            if (file == null) return NotFound();
            return File(file.Content, file.ContentType, file.FileName);
        }

        [HttpPost]
        public async Task<IActionResult> UploadMedia(IFormFile file, [FromForm] string tags = "")
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            using var memoryStream = new MemoryStream();
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


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedia(int id)
        {
            var media = await _context.MediaFiles.FindAsync(id);
            if (media == null)
            {
                return NotFound();
            }

            _context.MediaFiles.Remove(media);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}