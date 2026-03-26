import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingScreen from './screens/LandingScreen';
import StartScreen from './screens/StartScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import AdminLayout from './screens/admin/AdminLayout';
import AdminLoginScreen from './screens/admin/AdminLoginScreen';
import AdminDashboard from './screens/admin/AdminDashboard';
import AddQuestionScreen from './screens/admin/AddQuestionScreen';
import MediaManager from './screens/admin/MediaManager';
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
          <Route path="add-question" element={<AddQuestionScreen />} />
          <Route path="media" element={<MediaManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
