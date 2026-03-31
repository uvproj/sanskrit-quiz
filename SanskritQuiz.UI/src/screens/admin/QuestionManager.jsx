import React, { useState, useEffect } from 'react';
import MediaHelper from '../../helpers/MediaHelper';
import './AdminCommon.css';

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
    <form onSubmit={handleSubmit} className="question-form">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-form-inline">
        <div className="admin-input-group">
          <label className="admin-label">{type === 'Picture' ? 'Question Text (Optional)' : 'Question Text'}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            required={type === 'Word'}
            placeholder="Enter the question text..."
            className="admin-input"
          />
        </div>
        <div style={{ minWidth: '140px' }}>
          <label className="admin-label">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="admin-input">
            <option value="Word">Word</option>
            <option value="Picture">Picture</option>
          </select>
        </div>
      </div>

      {type === 'Picture' && (
        <div className="image-preview-container">
          <div style={{ flex: 1 }}>
            <label className="admin-label">Question Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.875rem' }} />
          </div>
          {(previewUrl || mediaUrl) && (
            <div style={{ position: 'relative' }}>
              <img
                src={previewUrl || MediaHelper.resolveMedia(mediaUrl)}
                alt="Preview"
                className="image-preview"
              />
              <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--admin-primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                Preview
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="admin-label">Choices (pick the correct one)</label>
        {options.map((opt, i) => (
          <div key={i} className="choice-item">
            <div className="choice-row">
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
                    className="admin-input"
                    style={{ flex: 1 }}
                  />
                  <select
                    value={opt.type}
                    onChange={(e) => handleOptionTypeChange(i, e.target.value)}
                    className="admin-input"
                    style={{ width: '120px' }}
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
                        className="image-preview"
                        style={{ height: '40px', width: '40px' }}
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
        <button type="button" onClick={onCancel} className="admin-btn admin-btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
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
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-flex">
        <div>
          <h1 className="admin-title">Question Management</h1>
          <p className="admin-subtitle">Create and edit questions with text or pictures.</p>
        </div>
        <button
          onClick={() => setEditingId(editingId === 'new' ? null : 'new')}
          className="admin-btn admin-btn-primary"
        >
          {editingId === 'new' ? '✕ Cancel' : '+ Add Question'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-success">
          {toast}
        </div>
      )}

      {/* Add Form */}
      {editingId === 'new' && (
        <div className="admin-card">
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
        <p className="admin-text-muted">Loading questions…</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Content</th>
                <th>Type</th>
                <th>Options</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <React.Fragment key={q.id}>
                  <tr style={{ background: editingId === q.id ? '#f8faff' : 'inherit' }}>
                    <td>{idx + 1}</td>
                    <td style={{ maxWidth: '340px', fontWeight: 500 }}>
                       {q.type === 'Picture' && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                           <img src={MediaHelper.resolveMedia(q.mediaUrl)} style={{ height: '30px', width: '30px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                         </div>
                       )}
                       {q.content}
                    </td>
                    <td>
                      <span className={`question-type-badge ${q.type.toLowerCase()}`}>{q.type}</span>
                    </td>
                    <td>{q.options?.length ?? 0}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingId(editingId === q.id ? null : q.id)}
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                        >
                          {editingId === q.id ? 'Close' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === q.id && (
                    <tr key={`edit-${q.id}`}>
                      <td colSpan={5} style={{ padding: '1.5rem', background: '#f8faff' }}>
                        <QuestionForm
                          initial={q}
                          onSave={(data) => handleEdit(q.id, data)}
                          onCancel={() => setEditingId(null)}
                          saving={saving}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
