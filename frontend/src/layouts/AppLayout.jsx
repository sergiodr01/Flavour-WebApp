import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';
import FlavorIcon from '../components/common/FlavorIcon';

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header className="app-header">
        <span className="app-title">
          <FlavorIcon />
          Flavour WebApp
        </span>
        <span className="app-user">
          <NotificationBell />
          {user.firstName} ({user.roles.join(', ')})
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </span>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
