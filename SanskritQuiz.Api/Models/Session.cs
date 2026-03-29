using System;
using System.Collections.Generic;

namespace SanskritQuiz.Api.Models
{
    public class QuizSession
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string ReviewMode { get; set; } = string.Empty;
        public string QuizType { get; set; } = string.Empty;
        public DateTime DateAndTime { get; set; }
        public int Score { get; set; }
        public int NumberOfQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int UnansweredAnswers { get; set; }

        public List<UserPerformance> Performances { get; set; } = new();
    }
}
