import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaHelper from '../helpers/MediaHelper';
import './QuizStyles.css';

export default function QuizScreen() {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState([]);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const dataString = localStorage.getItem('quizSession');
    if (!dataString) {
      navigate('/');
      return;
    }
    const data = JSON.parse(dataString);
    setSessionData(data);
    fetchQuestions(data.quizType, data.questionsCount);
  }, [navigate]);

  const fetchQuestions = async (quizType, count) => {
    try {
      var apiUrl = (`${import.meta.env.VITE_API_BASE_URL}/api/question/`);
      if (quizType == "vocabulary") {
        apiUrl += "vocabulary"
      }
      apiUrl += "?count=" + count;

      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };


  const currentQuestion = questions[currentIndex];

  const handleNextQuestion = useCallback((selectedOpt) => {
    // Record answer
    const timeTaken = 30 - timeLeft;
    const isUnanswered = !selectedOpt;
    const correctOption = currentQuestion.options.find(o => o.isCorrect);
    const isCorrect = selectedOpt ? selectedOpt.id === correctOption.id : false;

    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedOptionId: selectedOpt?.id || null,
      correctOptionId: correctOption.id,
      timeTaken,
      isCorrect,
      isUnanswered,
      question: currentQuestion,
      selectedOpt
    }]);

    if (sessionData.mode === 'immediate' && selectedOpt && !isFeedbackMode) {
      // Show feedback for 3 seconds then go next
      setSelectedOption(selectedOpt);
      setIsFeedbackMode(true);
      setTimeout(() => {
        setIsFeedbackMode(false);
        setSelectedOption(null);
        proceedToNext();
      }, 3000);
      return;
    }

    proceedToNext();
  }, [currentQuestion, timeLeft, sessionData, isFeedbackMode]);

  const proceedToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    // Current answers + the one just added
    // The state closure might not have latest answers if called synchronously,
    // so we rely on the submit in a useEffect or passing answers directly.
    navigate('/results');
  };

  // Timer Effect
  useEffect(() => {
    if (!currentQuestion || isFeedbackMode) return;

    if (timeLeft === 0) {
      handleNextQuestion(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion, isFeedbackMode, handleNextQuestion]);

  // Keyboard support Effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFeedbackMode || !currentQuestion) return;
      const key = parseInt(e.key);
      if (key >= 1 && key <= 4) {
        const option = currentQuestion.options[key - 1];
        if (option) {
          handleNextQuestion(option);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, isFeedbackMode, handleNextQuestion]);

  useEffect(() => {
    if (answers.length > 0 && answers.length === questions.length && !isFeedbackMode) {
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
      navigate('/results');
    }
  }, [answers, questions.length, isFeedbackMode, navigate]);

  if (!currentQuestion) return (
    <div className="quiz-container">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="quiz-container bg-light-gray">
      <div className="card quiz-card-full">
        {/* Header */}
        <header className="quiz-header quiz-header-compact">
          <div>Question {currentIndex + 1} of {questions.length}</div>
          <div className="quiz-timer">
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className={timeLeft <= 5 ? 'timer-pulse' : ''}>00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </header>

        {/* Question Area */}
        <div className="question-area">
          {currentQuestion.type === 'Picture' ? (
            <img src={MediaHelper.resolveMedia(currentQuestion.mediaUrl)} alt="Question" className="question-image" />
          ) : null}
          {currentQuestion.content && (
            <h2 className="text-4xl-bold">{currentQuestion.content}</h2>
          )}
        </div>

        {/* Options Grid */}
        <div className="options-container">
          <div className="options-grid">
            {currentQuestion.options.map((opt, idx) => {
              let btnStateClass = "";

              if (isFeedbackMode) {
                if (opt.isCorrect) {
                  btnStateClass = "correct";
                } else if (selectedOption?.id === opt.id) {
                  btnStateClass = "wrong";
                } else {
                  btnStateClass = "muted";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => !isFeedbackMode && handleNextQuestion(opt)}
                  disabled={isFeedbackMode}
                  className={`option-btn ${btnStateClass}`}
                >
                  <span className="option-number">{idx + 1}</span>
                  {opt.type === 'Picture' ? (
                    <img src={MediaHelper.resolveMedia(opt.mediaUrl)} alt={`Option ${idx + 1}`} className="option-image" />
                  ) : (
                    <span className="option-content">{opt.content}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
