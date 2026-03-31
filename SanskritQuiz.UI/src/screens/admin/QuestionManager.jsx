import { useState, useEffect } from 'react';
import MediaHelper from '../../helpers/MediaHelper';

const API = import.meta.env.VITE_API_BASE_URL;

const EMPTY_OPTIONS = [
  { content: '', isCorrect: true },
  { content: '', isCorrect: false },
  { content: '', isCorrect: false },
  { content: '', isCorrect: false },
];

function QuestionForm({ initial, onSave, onCancel, saving }) {
  const [content, setContent] = useState(initial?.content ?? '');
  const [type, setType] = useState(initial?.type ?? 'Word');
  const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? '');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [options, setOptions] = useState(
    initial?.options?.length
      ? initial.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect, type: o.type ?? 'Word', mediaUrl: o.mediaUrl ?? '' }))
      : EMPTY_OPTIONS.map((o) => ({ ...o, type: 'Word', mediaUrl: '' }))
  );
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleOptionChange = (i, value) => {
    const next = [...options];
    next[i] = { ...next[i], content: value };
    setOptions(next);
  };

  const handleOptionTypeChange = (i, newType) => {
    const next = [...options];
    next[i] = { ...next[i], type: newType };
    setOptions(next);
  };

  const handleOptionFileChange = (i, e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const next = [...options];
      next[i] = { ...next[i], file: selectedFile, previewUrl: URL.createObjectURL(selectedFile) };
      setOptions(next);
    }
  };

  const handleCorrectChange = (i) => {
    setOptions(options.map((o, idx) => ({ ...o, isCorrect: idx === i })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === 'Word' && !content.trim()) return setError('Question content is required.');
    if (type === 'Picture' && !file && !mediaUrl) return setError('An image is required for Picture type.');
    if (options.some((o) => o.type === 'Word' && !o.content.trim())) return setError('All choices must be filled.');
    if (options.some((o) => o.type === 'Picture' && !o.file && !o.mediaUrl)) return setError('An image is required for all Picture type options.');
    setError('');

    let finalMediaUrl = mediaUrl;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${API}/api/media`, { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          finalMediaUrl = `media://${data.id}`;
        } else {
          return setError('Failed to upload question image.');
        }
      } catch (err) {
        return setError('Error uploading question image: ' + err.message);
      }
    }

    const finalOptions = [];
    for (const opt of options) {
      let optMediaUrl = opt.mediaUrl;
      if (opt.file) {
        const formData = new FormData();
        formData.append('file', opt.file);
        try {
          const res = await fetch(`${API}/api/media`, { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            optMediaUrl = `media://${data.id}`;
          } else {
            return setError('Failed to upload option image.');
          }
        } catch (err) {
          return setError('Error uploading option image: ' + err.message);
        }
      }
      finalOptions.push({ content: opt.content, isCorrect: opt.isCorrect, type: opt.type, mediaUrl: optMediaUrl });
    }

    onSave({ content, type, mediaUrl: finalMediaUrl, options: finalOptions });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{type === 'Picture' ? 'Question Text (Optional)' : 'Question Text'}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            required={type === 'Word'}
            placeholder="Enter the question text..."
            style={inputStyle}
          />
        </div>
        <div style={{ minWidth: '140px' }}>
          <label style={labelStyle}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            <option value="Word">Word</option>
            <option value="Picture">Picture</option>
          </select>
        </div>
      </div>

      {type === 'Picture' && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Question Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.875rem' }} />
          </div>
          {(previewUrl || mediaUrl) && (
            <div style={{ position: 'relative' }}>
              <img
                src={previewUrl || MediaHelper.resolveMedia(mediaUrl)}
                alt="Preview"
                style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
              />
              <div style={{ position: 'absolute', top: -8, right: -8, background: '#4f46e5', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                Preview
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <label style={labelStyle}>Choices (pick the correct one)</label>
        {options.map((opt, i) => (
          <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="radio"
                name={`correct-${initial?.id ?? 'new'}`}
                checked={opt.isCorrect}
                onChange={() => handleCorrectChange(i)}
                style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={opt.content}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    required={opt.type === 'Word'}
                    placeholder={`Choice ${i + 1} text...`}
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                  />
                  <select
                    value={opt.type}
                    onChange={(e) => handleOptionTypeChange(i, e.target.value)}
                    style={{ ...inputStyle, width: '100px', marginBottom: 0 }}
                  >
                    <option value="Word">Word</option>
                    <option value="Picture">Picture</option>
                  </select>
                </div>
                {opt.type === 'Picture' && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleOptionFileChange(i, e)} style={{ fontSize: '0.75rem' }} />
                    {(opt.previewUrl || opt.mediaUrl) && (
                      <img
                        src={opt.previewUrl || MediaHelper.resolveMedia(opt.mediaUrl)}
                        alt="Preview"
                        style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
        <button type="submit" disabled={saving} style={saveBtnStyle(saving)}>
          {saving ? 'Saving…' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = none, 'new' = add form
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/question`);
      if (res.ok) setQuestions(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAdd = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Type: formData.type,
          Content: formData.content,
          MediaUrl: formData.mediaUrl,
          Options: formData.options.map((o) => ({ Content: o.content, IsCorrect: o.isCorrect, Type: o.type, MediaUrl: o.mediaUrl })),
        }),
      });
      if (res.ok) {
        setEditingId(null);
        showToast('Question added ✓');
        await loadQuestions();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id, formData) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/question/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Id: id,
          Type: formData.type,
          Content: formData.content,
          MediaUrl: formData.mediaUrl,
          Options: formData.options.map((o) => ({ Content: o.content, IsCorrect: o.isCorrect, Type: o.type, MediaUrl: o.mediaUrl })),
        }),
      });
      if (res.ok) {
        setEditingId(null);
        showToast('Question updated ✓');
        await loadQuestions();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;

    try {
      const res = await fetch(`${API}/api/question/${questionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Question deleted ✓');
        loadQuestions();
      } else {
        alert('Delete failed');
      }
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', margin: 0 }}>Question Management</h1>
        <button
          onClick={() => setEditingId(editingId === 'new' ? null : 'new')}
          style={saveBtnStyle(false)}
        >
          {editingId === 'new' ? '✕ Cancel' : '+ Add Question'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', color: '#166534', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
          {toast}
        </div>
      )}

      {/* Add Form */}
      {editingId === 'new' && (
        <div style={formPanelStyle}>
          <h3 style={{ margin: '0 0 1rem', color: '#1e293b' }}>New Question</h3>
          <QuestionForm
            onSave={handleAdd}
            onCancel={() => setEditingId(null)}
            saving={saving}
          />
        </div>
      )}

      {/* Questions Table */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading questions…</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Content</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Options</th>
                <th style={thStyle}></th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <>
                  <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9', background: editingId === q.id ? '#f8faff' : 'white' }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={{ ...tdStyle, maxWidth: '340px', fontWeight: 500 }}>{q.content}</td>
                    <td style={tdStyle}>
                      <span style={typeBadge(q.type)}>{q.type}</span>
                    </td>
                    <td style={tdStyle}>{q.options?.length ?? 0}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => setEditingId(editingId === q.id ? null : q.id)}
                        style={editBtnStyle}
                      >
                        {editingId === q.id ? 'Close' : 'Edit'}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(q.id)}
                        style={deleteBtnStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {editingId === q.id && (
                    <tr key={`edit-${q.id}`}>
                      <td colSpan={5} style={{ padding: '1.5rem', background: '#f8faff', borderBottom: '2px solid #e0e7ff' }}>
                        <QuestionForm
                          initial={q}
                          onSave={(data) => handleEdit(q.id, data)}
                          onCancel={() => setEditingId(null)}
                          saving={saving}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No questions found. Add your first one above!
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

// --- Styles ---
const labelStyle = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' };
const inputStyle = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' };
const thStyle = { padding: '0.85rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem' };
const tdStyle = { padding: '0.85rem 1rem', color: '#334155', fontSize: '0.95rem' };
const editBtnStyle = { padding: '0.4rem 0.9rem', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const cancelBtnStyle = { padding: '0.6rem 1.2rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 };
const saveBtnStyle = (disabled) => ({ padding: '0.6rem 1.4rem', background: disabled ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600 });
const formPanelStyle = { background: 'white', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '2px solid #e0e7ff' };
const typeBadge = (type) => ({ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, background: type === 'Word' ? '#ede9fe' : '#fef3c7', color: type === 'Word' ? '#6d28d9' : '#92400e' });
const deleteBtnStyle = { background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' };