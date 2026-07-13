import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const isCustomer = user.roles.includes('customer');
  const isFlavorist = user.roles.includes('flavorist');

  return (
    <div>
      <h2>Welcome, {user.firstName}</h2>
      <p className="muted">Role: {user.roles.join(', ')}</p>

      {isCustomer && (
        <p>
          <Link to="/flavors">View my flavors</Link>
        </p>
      )}
      {isFlavorist && (
        <p>
          <Link to="/review">View submitted flavors</Link>
        </p>
      )}
    </div>
  );
}
