import { useState, useEffect, useRef } from 'react';
import './AdminCommon.css';

export default function MediaManager() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/media`);
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tags', tags);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/media`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setFile(null);
        setTags('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchMedia();
      } else {
        alert('Upload failed');
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/media/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchMedia();
      } else {
        alert('Delete failed');
      }
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  if (loading) return <div>Loading media...</div>;

  return (
    <div className="admin-page-container">
      <h1 className="admin-title">Media Manager</h1>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem' }}>Upload New Media</h2>
        <form onSubmit={handleUpload} className="admin-form-inline">
          <div className="admin-input-group">
            <label className="admin-label">File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="admin-input"
            />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. animal, tree, nature"
              className="admin-input"
            />
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className="admin-btn admin-btn-primary"
            style={{ height: '42px' }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="admin-grid-cards">
        {mediaFiles.map(m => (
          <div key={m.id} className="admin-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            {m.contentType && m.contentType.startsWith('image/') ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/api/media/${m.id}`}
                alt={m.fileName}
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
              />
            ) : (
              <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>
                {m.contentType}
              </div>
            )}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.fileName}>
                  {m.fileName}
                </div>
                <div className="quiz-badge" style={{ fontSize: '0.75rem', display: 'inline-block' }}>
                  Tags: {m.tags || 'none'}
                </div>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="admin-btn admin-btn-danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', alignSelf: 'flex-start', marginTop: '1rem' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {mediaFiles.length === 0 && (
          <div className="admin-text-muted" style={{ gridColumn: '1 / -1' }}>No media files uploaded yet.</div>
        )}
      </div>
    </div>
  );
}
