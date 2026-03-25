using System.Collections.Generic;

namespace SanskritQuiz.Api.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // "Picture" or "Word"
        public string? Content { get; set; }
        public string? MediaUrl { get; set; }
        
        public List<Option> Options { get; set; } = new();
    }
}
