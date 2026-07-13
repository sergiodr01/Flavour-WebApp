import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSubmittedFlavors } from '../../api/reviewApi';

export default function SubmittedFlavorsPage() {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmittedFlavors()
      .then(setFlavors)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading submitted flavors...</p>;

  return (
    <div>
      <h2>Submitted Flavors</h2>
      {flavors.length === 0 && <p>No flavors pending review.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {flavors.map((f) => (
          <li
            key={f.id}
            style={{ border: '1px solid #ddd', borderRadius: 4, padding: '0.75rem', marginBottom: '0.5rem' }}
          >
            <Link to={`/review/${f.id}`} style={{ fontWeight: 'bold' }}>
              {f.label}
            </Link>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {f.name} · v{f.version}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
