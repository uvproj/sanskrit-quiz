import { useNavigate } from 'react-router-dom';

export default function LandingScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Sanskrit Quiz
          </h1>
          <p className="text-gray-500">Test your vocabulary knowledge</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => navigate('/start')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-md"
          >
            Start Quiz
          </button>
          
          <button 
            onClick={() => navigate('/admin/login')}
            className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02]"
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}
