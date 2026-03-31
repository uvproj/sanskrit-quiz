import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuizStyles.css';

export default function StartScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [reviewMode, setReviewMode] = useState('immediate');
  const [quizType, setQuizType] = useState('vocabulary');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserName: name,
          ReviewMode: reviewMode,
          QuizType: quizType,
          NumberOfQuestions: Number(questionsCount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('quizSession', JSON.stringify({
          sessionId: data.sessionId,
          name,
          reviewMode,
          quizType,
          questionsCount: Number(questionsCount)
        }));
        navigate('/quiz');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-container bg-gradient">
      <div className="card start-screen-card animate-fade-in">
        <h2 className="text-3xl-bold text-center">Quiz Setup</h2>

        <form onSubmit={handleStart} className="setup-form">
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="form-input"
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Review Mode</label>
            <select
              value={reviewMode}
              onChange={e => setReviewMode(e.target.value)}
              className="form-select"
            >
              <option value="immediate">Review Answers Immediately</option>
              <option value="end">Review Answers at the End</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quiz Type</label>
            <select
              value={quizType}
              onChange={e => setQuizType(e.target.value)}
              className="form-select"
            >
              <option value="">--All--</option>
              <option value="vocabulary">Vocabulary Words</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Number of Questions</label>
            <select
              value={questionsCount}
              onChange={e => setQuestionsCount(e.target.value)}
              className="form-select"
            >
              <option value={2}>2 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={30}>30 Questions</option>
              <option value={40}>40 Questions</option>
              <option value={50}>50 Questions</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-start"
            style={{ marginTop: '1.5rem' }}
          >
            {loading ? 'Setting up...' : 'Begin Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}
