import { useState, useEffect, useRef } from 'react';

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
    <div>
      <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '1.5rem' }}>Media Manager</h1>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem' }}>Upload New Media</h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
              required
              style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. animal, tree, nature"
              style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%' }}
            />
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            style={{
              background: '#4f46e5', color: 'white', padding: '0.5rem 1.5rem', height: '42px',
              borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
              opacity: (!file || uploading) ? 0.7 : 1
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {mediaFiles.map(m => (
          <div key={m.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {m.contentType && m.contentType.startsWith('image/') ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/api/media/${m.id}`}
                alt={m.fileName}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>
                {m.contentType}
              </div>
            )}
            <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.fileName}>
                  {m.fileName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Tags: {m.tags || 'none'}
                </div>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', alignSelf: 'flex-start' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {mediaFiles.length === 0 && (
          <div style={{ color: '#64748b', gridColumn: '1 / -1' }}>No media files uploaded yet.</div>
        )}
      </div>
    </div>
  );
}
