import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyFlavors } from '../../api/flavorApi';
import StateBadge from '../../components/common/StateBadge';

export default function FlavorListPage() {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyFlavors()
      .then(setFlavors)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading flavors...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>My Flavors</h2>
        <Link to="/flavors/new" className="btn btn-primary">
          + New Flavor
        </Link>
      </div>

      {flavors.length === 0 && <p className="empty-state">You haven't created any flavors yet.</p>}

      <ul className="card-list">
        {flavors.map((f) => (
          <li key={f.id} className="card">
            <Link to={`/flavors/${f.id}`} className="card-link">
              {f.name}
            </Link>{' '}
            <StateBadge state={f.state} />
            <div className="muted">
              {f.label} · v{f.version}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
