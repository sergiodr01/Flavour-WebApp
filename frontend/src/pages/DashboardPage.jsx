import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const isCustomer = user.roles.includes('customer');

  return (
    <div>
      <h2>Welcome, {user.firstName}</h2>
      <p>Role: {user.roles.join(', ')}</p>

      {isCustomer && (
        <p>
          <Link to="/flavors">View my flavors</Link>
        </p>
      )}
    </div>
  );
}
