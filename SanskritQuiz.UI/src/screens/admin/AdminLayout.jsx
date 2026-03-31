import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import './AdminCommon.css';

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
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Sanskrit Quiz</h2>
        <nav className="admin-sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>🏠 Dashboard</NavLink>
          <NavLink to="questions" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>❓ Questions</NavLink>
          <NavLink to="sessions" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>📊 Sessions</NavLink>
          <NavLink to="vocabulary" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>📖 Vocabulary</NavLink>
          <NavLink to="media" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>🖼️ Media</NavLink>
        </nav>
        <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
      </aside>

      {/* Content */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}
