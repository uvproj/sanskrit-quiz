import { useNavigate } from 'react-router-dom';
import './QuizStyles.css';

export default function LandingScreen() {
  const navigate = useNavigate();

  return (
    <div className="quiz-container bg-gradient">
      <div className="card animate-fade-in text-center">
        <div>
          <h1 className="text-4xl-bold text-gradient">
            Sanskrit Quiz
          </h1>
          <p className="text-muted">Test your vocabulary knowledge</p>
        </div>

        <div className="btn-group-vertical">
          <button 
            onClick={() => navigate('/start')}
            className="btn-start"
          >
            Start Quiz
          </button>
          
          <button 
            onClick={() => navigate('/admin/login')}
            className="btn-secondary"
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}
