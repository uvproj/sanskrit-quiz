import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingScreen from './screens/LandingScreen';
import StartScreen from './screens/StartScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import AdminLayout from './screens/admin/AdminLayout';
import AdminLoginScreen from './screens/admin/AdminLoginScreen';
import AdminDashboard from './screens/admin/AdminDashboard';
import QuestionManager from './screens/admin/QuestionManager';
import SessionsScreen from './screens/admin/SessionsScreen';
import MediaManager from './screens/admin/MediaManager';
import VocabularyManager from './screens/admin/VocabularyManager';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/start" element={<StartScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/results" element={<ResultsScreen />} />

        <Route path="/admin/login" element={<AdminLoginScreen />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="questions" element={<QuestionManager />} />
          <Route path="sessions" element={<SessionsScreen />} />
          <Route path="media" element={<MediaManager />} />
          <Route path="vocabulary" element={<VocabularyManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
