using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanskritQuiz.Api.Data;
using SanskritQuiz.Api.Models;

namespace SanskritQuiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VocabularyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VocabularyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetVocabularies()
        {
            var vocabularies = await _context.Vocabularies.ToListAsync();
            return Ok(vocabularies);
        }

        [HttpPost]
        public async Task<IActionResult> AddVocabulary([FromBody] Vocabulary vocabulary)
        {
            _context.Vocabularies.Add(vocabulary);
            await _context.SaveChangesAsync();
            return Ok(vocabulary);
        }

        [HttpPut("{sanskritWord}/{englishWord}")]
        public async Task<IActionResult> UpdateVocabulary(string sanskritWord, string englishWord, [FromBody] Vocabulary vocabulary)
        {
            var decodedSanskrit = Uri.UnescapeDataString(sanskritWord);
            var decodedEnglish = Uri.UnescapeDataString(englishWord);

            if (decodedSanskrit != vocabulary.SanskritWord || decodedEnglish != vocabulary.EnglishWord)
                return BadRequest("Key mismatch");

            var existing = await _context.Vocabularies.FindAsync(decodedSanskrit, decodedEnglish);
            if (existing == null) return NotFound();

            existing.Tags = vocabulary.Tags;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{sanskritWord}/{englishWord}")]
        public async Task<IActionResult> DeleteVocabulary(string sanskritWord, string englishWord)
        {
            var decodedSanskrit = Uri.UnescapeDataString(sanskritWord);
            var decodedEnglish = Uri.UnescapeDataString(englishWord);

            var existing = await _context.Vocabularies.FindAsync(decodedSanskrit, decodedEnglish);
            if (existing == null) return NotFound();

            _context.Vocabularies.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Vocabulary deleted" });
        }
    }
}