import { Link } from 'react-router-dom';
import StateBadge from '../common/StateBadge';

export default function VersionHistory({ versions, currentId }) {
  if (versions.length <= 1) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Version History</h3>
      <ul className="card-list">
        {versions.map((v) => (
          <li key={v.id} style={{ padding: '0.4rem 0', fontWeight: v.id === currentId ? 700 : 400 }}>
            {v.id === currentId ? (
              <span>v{v.version} (current)</span>
            ) : (
              <Link to={`/flavors/${v.id}`}>v{v.version}</Link>
            )}{' '}
            <StateBadge state={v.state} />
          </li>
        ))}
      </ul>
    </div>
  );
}
