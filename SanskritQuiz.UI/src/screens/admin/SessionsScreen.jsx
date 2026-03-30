import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL;

export default function SessionsScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/sessions`)
      .then((r) => r.json())
      .then((data) => setSessions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '1.5rem' }}>Quiz Sessions</h1>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading sessions…</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Date &amp; Time</th>
                <th style={thStyle}>Quiz Type</th>
                <th style={thStyle}>Mode</th>
                <th style={thStyle}>Questions</th>
                <th style={thStyle}>Correct</th>
                <th style={thStyle}>Score</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{s.userName}</td>
                  <td style={tdStyle}>
                    <Link
                      to={`/results?admin=true&sessionId=${s.id}`}
                      style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {new Date(s.dateAndTime).toLocaleString()}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <span style={quizTypeBadge(s.quizType)}>{s.quizType || '—'}</span>
                  </td>
                  <td style={tdStyle}>{s.reviewMode || '—'}</td>
                  <td style={tdStyle}>{s.numberOfQuestions}</td>
                  <td style={tdStyle}>{s.correctAnswers}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: scoreColor(s.score, s.numberOfQuestions) }}>
                    {s.score}%
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '0.85rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem' };
const tdStyle = { padding: '0.85rem 1rem', color: '#334155', fontSize: '0.95rem' };

const quizTypeBadge = (type) => ({
  padding: '0.2rem 0.65rem',
  borderRadius: '999px',
  fontSize: '0.78rem',
  fontWeight: 600,
  background: type === 'vocabulary' ? '#ede9fe' : '#f1f5f9',
  color: type === 'vocabulary' ? '#6d28d9' : '#475569',
});

const scoreColor = (score, total) => {
  if (!total) return '#475569';
  const pct = score;
  if (pct >= 80) return '#16a34a';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
};
