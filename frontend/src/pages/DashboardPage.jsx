import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Welcome, {user.firstName}</h2>
      <p>Role: {user.roles.join(', ')}</p>
    </div>
  );
}
