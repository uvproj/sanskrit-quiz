namespace SanskritQuiz.Api.Models
{
    public class Option
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string Type { get; set; } = string.Empty; // "Picture" or "Word"
        public string? Content { get; set; }
        public string? MediaUrl { get; set; }
        public bool IsCorrect { get; set; }
    }
}
