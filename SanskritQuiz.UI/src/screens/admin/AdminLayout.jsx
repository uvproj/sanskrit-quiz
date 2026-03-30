import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import './AdminAuth.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#1e293b', color: 'white', padding: '1.75rem 1.25rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.1rem', letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase' }}>Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <Link to="/admin" className="admin-nav-link">🏠 Dashboard</Link>
          <Link to="questions" className="admin-nav-link">❓ Questions</Link>
          <Link to="sessions" className="admin-nav-link">📊 Sessions</Link>
          <Link to="vocabulary" className="admin-nav-link">📖 Vocabulary</Link>
          <Link to="media" className="admin-nav-link">🖼️ Media</Link>
        </nav>
        <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, background: '#f8fafc', padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
