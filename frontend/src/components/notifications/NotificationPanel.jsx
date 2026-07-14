import { Link } from 'react-router-dom';

export default function NotificationPanel({ unread, old }) {
  const hasAny = unread.length > 0 || old.length > 0;

  return (
    <div className="notification-panel">
      {!hasAny && <p className="empty-state">No notifications yet.</p>}

      {unread.length > 0 && (
        <ul>
          {unread.map((item) => (
            <li key={item.flavorId} className="notification-item is-new">
              <span className="notification-tag notification-tag-new">NEW</span>
              <Link to={item.link}>{item.message}</Link>
            </li>
          ))}
        </ul>
      )}

      {unread.length > 0 && old.length > 0 && <hr className="notification-divider" />}

      {old.length > 0 && (
        <ul>
          {old.map((item) => (
            <li key={item.flavorId} className="notification-item is-old">
              <span className="notification-tag notification-tag-old">OLD</span>
              <Link to={item.link}>{item.message}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
