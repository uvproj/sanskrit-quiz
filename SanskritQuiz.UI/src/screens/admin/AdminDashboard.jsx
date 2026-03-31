import { useNavigate } from 'react-router-dom';
import './AdminCommon.css';

const cards = [
  {
    title: 'Questions',
    description: 'Browse, add, and edit quiz questions.',
    icon: '❓',
    path: '/admin/questions',
    accent: '#4f46e5',
    bg: '#ede9fe',
  },
  {
    title: 'Quiz Sessions',
    description: 'View all learner quiz sessions and scores.',
    icon: '📊',
    path: '/admin/sessions',
    accent: '#0891b2',
    bg: '#e0f2fe',
  },
  {
    title: 'Vocabulary',
    description: 'Manage the Sanskrit vocabulary database.',
    icon: '📖',
    path: '/admin/vocabulary',
    accent: '#059669',
    bg: '#d1fae5',
  },
  {
    title: 'Media',
    description: 'Upload and manage media assets.',
    icon: '🖼️',
    path: '/admin/media',
    accent: '#d97706',
    bg: '#fef3c7',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-page-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      <p className="admin-subtitle">Select a section to manage.</p>

      <div className="admin-grid-cards" style={{ marginTop: '2rem' }}>
        {cards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="admin-dashboard-card"
            style={{
              borderLeft: `6px solid ${card.accent}`,
              '--card-bg': card.bg
            }}
          >
            <div className="admin-card-icon">{card.icon}</div>
            <div className="admin-card-title" style={{ color: card.accent }}>
              {card.title}
            </div>
            <div className="admin-card-desc">{card.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
