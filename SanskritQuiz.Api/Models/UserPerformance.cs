namespace SanskritQuiz.Api.Models
{
    public class UserPerformance
    {
        public int Id { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public int QuestionId { get; set; }
        public int? SelectedOptionId { get; set; }
        public int CorrectOptionId { get; set; }
        public int TimeTaken { get; set; }
        public bool IsCorrect { get; set; }
        public bool IsUnanswered { get; set; }

        public Session? Session { get; set; }
        public Question? Question { get; set; }
    }
}
