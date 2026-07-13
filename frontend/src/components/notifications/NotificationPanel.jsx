import { Link } from 'react-router-dom';

export default function NotificationPanel({ items }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: '2rem',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: 4,
        minWidth: 240,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 10,
      }}
    >
      {items.length === 0 ? (
        <p style={{ padding: '0.75rem', margin: 0, color: '#666' }}>No new notifications.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: '0.5rem' }}>
          {items.map((item) => (
            <li key={item.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <Link to={item.link}>{item.message}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
