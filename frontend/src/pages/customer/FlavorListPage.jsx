import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyFlavors } from '../../api/flavorApi';

const STATE_COLORS = {
  new: '#6b7280',
  submitted: '#b45309',
  approved: '#15803d',
  rejected: '#b91c1c',
};

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Flavors</h2>
        <Link to="/flavors/new">+ New Flavor</Link>
      </div>

      {flavors.length === 0 && <p>You haven't created any flavors yet.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {flavors.map((f) => (
          <li
            key={f.id}
            style={{ border: '1px solid #ddd', borderRadius: 4, padding: '0.75rem', marginBottom: '0.5rem' }}
          >
            <Link to={`/flavors/${f.id}`} style={{ fontWeight: 'bold' }}>
              {f.label}
            </Link>{' '}
            <span style={{ color: STATE_COLORS[f.state] }}>[{f.state}]</span>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {f.name} · v{f.version}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
