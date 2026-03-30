import { useNavigate } from 'react-router-dom';

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
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Select a section to manage.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {cards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '1.5rem',
              background: 'white',
              border: `2px solid ${card.bg}`,
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              textAlign: 'left',
              transition: 'box-shadow 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.12)`)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{card.icon}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: card.accent, marginBottom: '0.4rem' }}>
              {card.title}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>{card.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
