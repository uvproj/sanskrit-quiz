import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminCommon.css';

const API = import.meta.env.VITE_API_BASE_URL;

export default function SessionsScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    setLoading(true);
    fetch(`${API}/api/sessions`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        setSelectedIds(new Set());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(sessions.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${count} selected sessions?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/sessions/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Array.from(selectedIds)),
      });

      if (res.ok) {
        alert('Sessions deleted successfully.');
        loadSessions();
      } else {
        const err = await res.text();
        alert('Delete failed: ' + err);
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting sessions');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header-flex">
        <div>
          <h1 className="admin-title">Quiz Sessions</h1>
          <p className="admin-subtitle">Monitor and manage learner performance.</p>
        </div>
        {selectedIds.size > 0 && (
          <button 
            className="admin-btn admin-btn-danger" 
            onClick={handleBulkDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
          </button>
        )}
      </div>

      {loading ? (
        <p className="admin-text-muted">Loading sessions…</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={sessions.length > 0 && selectedIds.size === sessions.length} 
                  />
                </th>
                <th>User</th>
                <th>Date & Time</th>
                <th>Quiz Type</th>
                <th>Mode</th>
                <th>Questions</th>
                <th>Correct</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(s.id)} 
                      onChange={() => toggleSelect(s.id)} 
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.userName}</td>
                  <td>
                    <Link
                      to={`/results?admin=true&sessionId=${s.id}`}
                      style={{ color: 'var(--admin-primary)', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {new Date(s.dateAndTime).toLocaleString()}
                    </Link>
                  </td>
                  <td>
                    <span className={`quiz-badge ${s.quizType === 'vocabulary' ? 'vocabulary' : ''}`}>
                      {s.quizType || '—'}
                    </span>
                  </td>
                  <td>{s.reviewMode || '—'}</td>
                  <td>{s.numberOfQuestions}</td>
                  <td>{s.correctAnswers}</td>
                  <td style={{ fontWeight: 700, color: scoreColor(s.score, s.numberOfQuestions) }}>
                    {s.score}%
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
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

const scoreColor = (score, total) => {
  if (!total) return '#475569';
  const pct = score;
  if (pct >= 80) return '#16a34a';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
};
