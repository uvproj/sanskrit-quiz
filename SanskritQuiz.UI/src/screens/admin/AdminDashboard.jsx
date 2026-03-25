import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading sessions...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: 0 }}>All Sessions</h1>
        <Link to="add-question" style={{ background: '#4f46e5', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Add New Question</Link>
      </div>
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', color: '#475569' }}>User</th>
              <th style={{ padding: '1rem', color: '#475569' }}>Date</th>
              <th style={{ padding: '1rem', color: '#475569' }}>Questions</th>
              <th style={{ padding: '1rem', color: '#475569' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>{s.userName}</td>
                <td style={{ padding: '1rem' }}>
                  <Link to={`/results?admin=true&sessionId=${s.id}`} style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                    {new Date(s.dateAndTime).toLocaleString()}
                  </Link>
                </td>
                <td style={{ padding: '1rem' }}>{s.numberOfQuestions}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{s.score}</td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>No sessions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
