import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Quiz Setup</h2>

        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Mode</label>
            <select
              value={reviewMode}
              onChange={e => setReviewMode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="immediate">Review Answers Immediately</option>
              <option value="end">Review Answers at the End</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Type</label>
            <select
              value={quizType}
              onChange={e => setQuizType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">--All--</option>
              <option value="vocabulary">Vocabulary Words</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
            <select
              value={questionsCount}
              onChange={e => setQuestionsCount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
            className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-md"
          >
            {loading ? 'Setting up...' : 'Begin Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}
