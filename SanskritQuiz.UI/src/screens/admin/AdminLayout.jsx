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
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/admin" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Dashboard (Sessions)</Link>
          <Link to="add-question" style={{ background: '#4f46e5', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Add New Question</Link>
          <button
            onClick={handleLogout}
            style={{ marginTop: 'auto', padding: '0.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
