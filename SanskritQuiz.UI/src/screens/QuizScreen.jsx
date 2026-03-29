import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

  if (!currentQuestion) return <div className="min-h-screen flex items-center justify-center p-4"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[80vh] min-h-[600px]">
        {/* Header */}
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <div className="font-semibold text-lg">Question {currentIndex + 1} of {questions.length}</div>
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className={`text - 2xl font - mono ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : ''} `}>00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          {currentQuestion.type === 'Picture' ? (
            <img src={currentQuestion.mediaUrl} alt="Question" className="max-h-64 object-contain mb-6 rounded-lg shadow-md" />
          ) : null}
          {currentQuestion.content && (
            <h2 className="text-4xl font-bold text-gray-800 mb-8">{currentQuestion.content}</h2>
          )}
        </div>

        {/* Options Grid */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, idx) => {
              let btnClass = "relative overflow-hidden group flex items-center justify-center p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all text-left w-full h-full min-h-[80px]";

              if (isFeedbackMode) {
                if (opt.isCorrect) {
                  btnClass = "relative overflow-hidden group flex items-center justify-center p-6 bg-green-50 border-2 border-green-500 rounded-2xl text-left w-full h-full min-h-[80px]";
                } else if (selectedOption?.id === opt.id) {
                  btnClass = "relative overflow-hidden group flex items-center justify-center p-6 bg-red-50 border-2 border-red-500 rounded-2xl text-left w-full h-full min-h-[80px]";
                } else {
                  btnClass = "relative overflow-hidden group flex items-center justify-center p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl text-left w-full h-full min-h-[80px] opacity-60";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => !isFeedbackMode && handleNextQuestion(opt)}
                  disabled={isFeedbackMode}
                  className={btnClass}
                >
                  <span className="absolute left-4 top-4 text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">{idx + 1}</span>
                  {opt.type === 'Picture' ? (
                    <img src={opt.mediaUrl} alt={`Option ${idx + 1} `} className="max-h-24 object-contain" />
                  ) : (
                    <span className="text-xl font-medium text-gray-700">{opt.content}</span>
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
