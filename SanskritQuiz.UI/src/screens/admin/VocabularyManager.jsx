import { useState, useEffect } from 'react';
import './AdminCommon.css';

export default function VocabularyManager() {
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newWord, setNewWord] = useState({ sanskritWord: '', englishWord: '', tags: '' });
  const [editingKey, setEditingKey] = useState(null); // composite key string: 'sanskrit|english'
  const [editForm, setEditForm] = useState({ tags: '' });

  useEffect(() => {
    fetchVocabularies();
  }, []);

  const fetchVocabularies = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vocabulary`);
      if (res.ok) {
        const data = await res.json();
        setVocabularies(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newWord.sanskritWord || !newWord.englishWord) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vocabulary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWord),
      });
      if (res.ok) {
        setNewWord({ sanskritWord: '', englishWord: '', tags: '' });
        fetchVocabularies();
      } else {
        alert('Failed to add vocabulary. It might already exist.');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding vocabulary');
    }
  };

  const startEditing = (vocab) => {
    setEditingKey(`${vocab.sanskritWord}|${vocab.englishWord}`);
    setEditForm({ tags: vocab.tags || '' });
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditForm({ tags: '' });
  };

  const handleSaveEdit = async (sanskritWord, englishWord) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vocabulary/${encodeURIComponent(sanskritWord)}/${encodeURIComponent(englishWord)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sanskritWord,
          englishWord,
          tags: editForm.tags
        }),
      });
      if (res.ok) {
        setEditingKey(null);
        fetchVocabularies();
      } else {
        alert('Failed to update');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating vocabulary');
    }
  };

  const handleDelete = async (sanskritWord, englishWord) => {
    if (!window.confirm('Delete this vocabulary word?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vocabulary/${encodeURIComponent(sanskritWord)}/${encodeURIComponent(englishWord)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchVocabularies();
      } else {
        alert('Delete failed');
      }
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  if (loading) return <div>Loading vocabulary...</div>;

  return (
    <div className="admin-page-container">
      <h1 className="admin-title">Vocabulary Manager</h1>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sanskrit Word</th>
              <th>English Word</th>
              <th>Tags</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f8fafc' }}>
              <td>
                <input
                  type="text"
                  value={newWord.sanskritWord}
                  onChange={e => setNewWord({ ...newWord, sanskritWord: e.target.value })}
                  placeholder="New Sanskrit Word"
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={newWord.englishWord}
                  onChange={e => setNewWord({ ...newWord, englishWord: e.target.value })}
                  placeholder="New English Word"
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={newWord.tags}
                  onChange={e => setNewWord({ ...newWord, tags: e.target.value })}
                  placeholder="Tags (comma-separated)"
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={handleAdd}
                  disabled={!newWord.sanskritWord || !newWord.englishWord}
                >
                  Add
                </button>
              </td>
            </tr>

            {vocabularies.map(v => {
              const key = `${v.sanskritWord}|${v.englishWord}`;
              const isEditing = editingKey === key;

              return (
                <tr key={key}>
                  <td style={{ fontWeight: 'bold' }}>{v.sanskritWord}</td>
                  <td>{v.englishWord}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.tags}
                        onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                        className="admin-input"
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <span className="quiz-badge">{v.tags || 'none'}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSaveEdit(v.sanskritWord, v.englishWord)} className="admin-btn admin-btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Save</button>
                          <button onClick={cancelEditing} className="admin-btn admin-btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(v)} className="admin-btn admin-btn-primary" style={{ background: '#f59e0b', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Edit</button>
                          <button onClick={() => handleDelete(v.sanskritWord, v.englishWord)} className="admin-btn admin-btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {vocabularies.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }} className="admin-text-muted">No vocabulary words found. Add one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
