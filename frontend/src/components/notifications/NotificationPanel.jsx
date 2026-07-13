import { Link } from 'react-router-dom';

export default function NotificationPanel({ items }) {
  return (
    <div className="notification-panel">
      {items.length === 0 ? (
        <p className="empty-state">No new notifications.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link to={item.link}>{item.message}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
