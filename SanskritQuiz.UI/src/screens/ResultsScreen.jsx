import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sessions/${id}/performances`);
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
        setSessionData({ name: 'Admin (Viewing past session)', mode: 'end' });
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

  if (saving) return <div className="min-h-screen flex text-xl font-medium items-center justify-center">Saving Results...</div>;

  const correctCount = answers.filter(a => a.isCorrect).length;
  const unansweredCount = answers.filter(a => a.isUnanswered).length;
  const incorrectCount = answers.length - correctCount - unansweredCount;
  const score = correctCount * 10;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 py-12">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Summary Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">Quiz Complete!</h1>
          <p className="text-gray-500 mb-8">Excellent effort, {sessionData?.name}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-indigo-50 rounded-2xl">
               <div className="text-sm font-medium text-indigo-500 mb-1">Total Score</div>
               <div className="text-3xl font-bold text-indigo-700">{score}</div>
            </div>
            <div className="p-6 bg-green-50 rounded-2xl">
               <div className="text-sm font-medium text-green-500 mb-1">Correct</div>
               <div className="text-3xl font-bold text-green-700">{correctCount}</div>
            </div>
            <div className="p-6 bg-red-50 rounded-2xl">
               <div className="text-sm font-medium text-red-500 mb-1">Incorrect</div>
               <div className="text-3xl font-bold text-red-700">{incorrectCount}</div>
            </div>
            <div className="p-6 bg-gray-100 rounded-2xl">
               <div className="text-sm font-medium text-gray-500 mb-1">Unanswered</div>
               <div className="text-3xl font-bold text-gray-700">{unansweredCount}</div>
            </div>
          </div>
        </div>

        {/* Detailed Answers */}
        {(sessionData.mode === 'end' || sessionData.mode === 'immediate') && (
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Review</h2>
          <div className="space-y-6">
            {answers.map((ans, i) => {
               const correctOpt = ans.question.options.find(o => o.isCorrect);
               return (
                 <div key={i} className={`p-6 rounded-2xl border-2 ${ans.isCorrect ? 'border-green-100 bg-green-50' : ans.isUnanswered ? 'border-gray-200 bg-gray-50' : 'border-red-100 bg-red-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-semibold text-gray-800">Q{i+1}: {ans.question.content}</h3>
                       {ans.isCorrect && <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">Correct</span>}
                       {!ans.isCorrect && !ans.isUnanswered && <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider">Incorrect</span>}
                       {ans.isUnanswered && <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">Unanswered</span>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                       <div>
                         <span className="text-gray-500 block mb-1">Your Answer:</span>
                         {ans.isUnanswered ? (
                           <span className="text-gray-400 italic">None selected</span>
                         ) : (
                           <span className={`font-medium ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{ans.selectedOpt?.content || '(Picture)'}</span>
                         )}
                       </div>
                       <div>
                         <span className="text-gray-500 block mb-1">Correct Answer:</span>
                         <span className="font-medium text-green-700">{correctOpt?.content || '(Picture)'}</span>
                       </div>
                    </div>
                 </div>
               )
            })}
          </div>
        </div>
        )}

        <div className="text-center pb-8">
           <button 
             onClick={() => navigate(isAdminView ? '/admin' : '/')}
             className="px-8 py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-lg transition-transform transform hover:scale-105 shadow-xl"
           >
             {isAdminView ? 'Return to Dashboard' : 'Return Home'}
           </button>
        </div>

      </div>
    </div>
  );
}
