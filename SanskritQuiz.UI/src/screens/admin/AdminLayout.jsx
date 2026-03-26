import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import './AdminAuth.css'; // Reusing some CSS

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
      <div style={{ width: '250px', background: '#1e293b', color: 'white', padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
          <Link to="/admin" className="admin-nav-link">Dashboard (Sessions)</Link>
          <Link to="vocabulary" className="admin-nav-link">Manage Vocabulary</Link>
          <Link to="media" className="admin-nav-link">Manage Media</Link>
          <Link to="add-question" className="admin-nav-link">Add New Question</Link>
          <button
            onClick={handleLogout}
            className="admin-logout-btn"
          >
            Logout
          </button>
        </nav>
      </div>
      <div style={{ flex: 1, background: '#f8fafc', padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div >
  );
}
