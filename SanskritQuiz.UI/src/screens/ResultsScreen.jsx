import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MediaHelper from '../helpers/MediaHelper';
import './QuizStyles.css';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isAdminView = queryParams.get('admin') === 'true';
  const adminSessionId = queryParams.get('sessionId');

  const [sessionData, setSessionData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    if (isAdminView && adminSessionId) {
      fetchAdminResults(adminSessionId);
    } else {
      loadLocalResults();
    }
  }, [navigate, isAdminView, adminSessionId]);

  const fetchAdminResults = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sessions/${id}/performances`);
      if (res.ok) {
        const performances = await res.json();
        const mappedAns = performances.map(p => ({
          questionId: p.questionId,
          selectedOptionId: p.selectedOptionId,
          correctOptionId: p.correctOptionId,
          timeTaken: p.timeTaken,
          isCorrect: p.isCorrect,
          isUnanswered: p.isUnanswered,
          question: p.question,
          selectedOpt: p.question?.options?.find(o => o.id === p.selectedOptionId)
        }));
        setAnswers(mappedAns);
        setSessionData({ name: 'Admin (Viewing past session)', reviewMode: 'end' });
      } else {
        navigate('/admin');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };


  const loadLocalResults = () => {
    const sessionStr = localStorage.getItem('quizSession');
    const answersStr = localStorage.getItem('quizAnswers');

    if (!sessionStr || !answersStr) {
      navigate('/');
      return;
    }

    const session = JSON.parse(sessionStr);
    const ans = JSON.parse(answersStr);

    setSessionData(session);
    setAnswers(ans);

    submitResults(session, ans);
  };

  const submitResults = async (session, ans) => {
    const correctAnswers = ans.filter(a => a.isCorrect).length;
    const unansweredAnswers = ans.filter(a => a.isUnanswered).length;
    // Score logic: +10 per correct answer for example
    const score = correctAnswers * 10;

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sessions/${session.sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Score: score,
          CorrectAnswers: correctAnswers,
          UnansweredAnswers: unansweredAnswers,
          Performances: ans.map(a => ({
            QuestionId: a.questionId,
            SelectedOptionId: a.selectedOptionId,
            CorrectOptionId: a.correctOptionId,
            TimeTaken: a.timeTaken,
            IsCorrect: a.isCorrect,
            IsUnanswered: a.isUnanswered
          }))
        })
      });
    } catch (error) {
      console.error("Failed to save session results:", error);
    } finally {
      setSaving(false);
    }
  };

  if (saving) return (
    <div className="quiz-container">
      <div className="text-3xl-bold">Saving Results...</div>
    </div>
  );

  const correctCount = answers.filter(a => a.isCorrect).length;
  const unansweredCount = answers.filter(a => a.isUnanswered).length;
  const incorrectCount = answers.length - correctCount - unansweredCount;
  const score = correctCount * 10;

  return (
    <div className="quiz-container bg-light-gray" style={{ justifyContent: 'flex-start', padding: '3rem 1rem' }}>
      <div className="w-full" style={{ maxWidth: '44rem' }}>
        
        {/* Summary Card */}
        <div className="card results-summary-card animate-fade-in">
          <div>
            <h1 className="text-4xl-bold text-gradient">Quiz Complete!</h1>
            <p className="text-muted">Excellent effort, {sessionData?.name}</p>
          </div>

          <div className="results-grid">
            <div className="stat-item score">
              <span className="stat-label">Total Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item correct">
              <span className="stat-label">Correct</span>
              <span className="stat-value">{correctCount}</span>
            </div>
            <div className="stat-item incorrect">
              <span className="stat-label">Incorrect</span>
              <span className="stat-value">{incorrectCount}</span>
            </div>
            <div className="stat-item unanswered">
              <span className="stat-label">Unanswered</span>
              <span className="stat-value">{unansweredCount}</span>
            </div>
          </div>
        </div>

        {/* Detailed Answers */}
        {(sessionData.reviewMode === 'end' || sessionData.reviewMode === 'immediate') && (
          <div className="card results-review-card">
            <h2 className="text-3xl-bold">Detailed Review</h2>
            <div className="setup-form">
              {answers.map((ans, i) => {
                const correctOpt = ans.question.options.find(o => o.isCorrect);
                const statusClass = ans.isCorrect ? 'correct' : (ans.isUnanswered ? 'unanswered' : 'wrong');
                
                return (
                  <div key={i} className={`review-item ${statusClass}`}>
                    <div className="review-header">
                      <div className="flex-1">
                        <h3 className="review-question">Q{i + 1}: {ans.question.content}</h3>
                        {ans.question.type === 'Picture' && (
                          <img src={MediaHelper.resolveMedia(ans.question.mediaUrl)} alt="Question" className="question-image" style={{ maxHeight: '100px', marginTop: '0.5rem' }} />
                        )}
                      </div>
                      <span className={`feedback-badge ${statusClass}`}>
                        {statusClass}
                      </span>
                    </div>

                    <div className="review-comparison">
                      <div>
                        <span className="comparison-label">Your Answer:</span>
                        {ans.isUnanswered ? (
                          <span className="text-muted" style={{ fontStyle: 'italic' }}>None selected</span>
                        ) : (
                          <div className={`comparison-value ${ans.isCorrect ? 'correct' : 'wrong'}`}>
                            {ans.selectedOpt?.type === 'Picture' ? (
                              <img src={MediaHelper.resolveMedia(ans.selectedOpt.mediaUrl)} alt="Your Answer" className="option-image" style={{ height: '40px' }} />
                            ) : (
                              ans.selectedOpt?.content || '(Picture)'
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="comparison-label">Correct Answer:</span>
                        <div className="comparison-value correct">
                          {correctOpt?.type === 'Picture' ? (
                            <img src={MediaHelper.resolveMedia(correctOpt.mediaUrl)} alt="Correct Answer" className="option-image" style={{ height: '40px' }} />
                          ) : (
                            correctOpt?.content || '(Picture)'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate(isAdminView ? '/admin' : '/')}
            className="btn-finish"
          >
            {isAdminView ? 'Return to Dashboard' : 'Return Home'}
          </button>
        </div>

      </div>
    </div>
  );
}
