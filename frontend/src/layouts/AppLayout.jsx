import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid #ddd',
        }}
      >
        <strong>Flavour WebApp</strong>
        <span>
          {user.firstName} ({user.roles.join(', ')})
          <button onClick={logout} style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </span>
      </header>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
