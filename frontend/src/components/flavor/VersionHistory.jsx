import { Link } from 'react-router-dom';

const STATE_COLORS = {
  new: '#6b7280',
  submitted: '#b45309',
  approved: '#15803d',
  rejected: '#b91c1c',
};

export default function VersionHistory({ versions, currentId }) {
  if (versions.length <= 1) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Version History</h3>
      <ul>
        {versions.map((v) => (
          <li key={v.id} style={{ fontWeight: v.id === currentId ? 'bold' : 'normal' }}>
            {v.id === currentId ? (
              <span>v{v.version} (current)</span>
            ) : (
              <Link to={`/flavors/${v.id}`}>v{v.version}</Link>
            )}{' '}
            <span style={{ color: STATE_COLORS[v.state] }}>[{v.state}]</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
