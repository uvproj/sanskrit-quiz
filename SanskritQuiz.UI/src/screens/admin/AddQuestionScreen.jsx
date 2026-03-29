import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddQuestionScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [content, setContent] = useState('');
  const [options, setOptions] = useState([
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].content = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return setError('Question content is required.');
    if (options.some(o => !o.content.trim())) return setError('All choices must be filled.');

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Type: 'Word',
          Content: content,
          Options: options.map(o => ({
            Content: o.content,
            IsCorrect: o.isCorrect
          }))
        })
      });

      if (response.ok) {
        navigate('/admin');
      } else {
        const text = await response.text();
        setError(text || 'Failed to add question');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#1e293b' }}>Add New Question</h2>

      {error && (
        <div style={{ padding: '1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569' }}>Question Text</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            placeholder="Enter the question here..."
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', color: '#475569' }}>Choices (Select the correct one)</label>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <input
                type="radio"
                name="correctChoice"
                checked={opt.isCorrect}
                onChange={() => handleCorrectChange(i)}
                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={opt.content}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                required
                placeholder={`Choice ${i + 1}`}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '1rem',
            background: loading ? '#94a3b8' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '1rem'
          }}
        >
          {loading ? 'Saving...' : 'Save Question'}
        </button>
      </form>
    </div>
  );
}
