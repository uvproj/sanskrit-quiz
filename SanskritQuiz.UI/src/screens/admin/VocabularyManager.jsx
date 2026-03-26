import { useState, useEffect } from 'react';

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
    <div>
      <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '1.5rem' }}>Vocabulary Manager</h1>

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', color: '#475569' }}>Sanskrit Word</th>
              <th style={{ padding: '1rem', color: '#475569' }}>English Word</th>
              <th style={{ padding: '1rem', color: '#475569' }}>Tags</th>
              <th style={{ padding: '1rem', color: '#475569', width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              <td style={{ padding: '0.75rem' }}>
                <input
                  type="text"
                  value={newWord.sanskritWord}
                  onChange={e => setNewWord({ ...newWord, sanskritWord: e.target.value })}
                  placeholder="New Sanskrit Word"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '0.75rem' }}>
                <input
                  type="text"
                  value={newWord.englishWord}
                  onChange={e => setNewWord({ ...newWord, englishWord: e.target.value })}
                  placeholder="New English Word"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '0.75rem' }}>
                <input
                  type="text"
                  value={newWord.tags}
                  onChange={e => setNewWord({ ...newWord, tags: e.target.value })}
                  placeholder="Tags (comma-separated)"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '0.75rem' }}>
                <button
                  onClick={handleAdd}
                  disabled={!newWord.sanskritWord || !newWord.englishWord}
                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: (!newWord.sanskritWord || !newWord.englishWord) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  Add
                </button>
              </td>
            </tr>

            {vocabularies.map(v => {
              const key = `${v.sanskritWord}|${v.englishWord}`;
              const isEditing = editingKey === key;

              return (
                <tr key={key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{v.sanskritWord}</td>
                  <td style={{ padding: '1rem' }}>{v.englishWord}</td>
                  <td style={{ padding: '1rem' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.tags}
                        onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                    ) : (
                      v.tags || <span style={{ color: '#94a3b8' }}>none</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(v.sanskritWord, v.englishWord)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Save</button>
                        <button onClick={cancelEditing} style={{ background: '#cbd5e1', color: '#334155', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(v)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Edit</button>
                        <button onClick={() => handleDelete(v.sanskritWord, v.englishWord)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {vocabularies.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No vocabulary words found. Add one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
