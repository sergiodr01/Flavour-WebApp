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
      {flavors.length === 0 && <p className="empty-state">No flavors pending review.</p>}
      <ul className="card-list">
        {flavors.map((f) => (
          <li key={f.id} className="card">
            <Link to={`/review/${f.id}`} className="card-link">
              {f.name}
            </Link>
            <div className="muted">
              {f.label} · v{f.version}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
