import { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const { items, count, markAllAsSeen } = useNotifications();
  const [open, setOpen] = useState(false);

  function toggle() {
    if (open) {
      markAllAsSeen();
    }
    setOpen(!open);
  }

  return (
    <div className="notification-bell">
      <button type="button" onClick={toggle} className="notification-bell-btn">
        🔔
        {count > 0 && <span className="notification-badge">{count}</span>}
      </button>
      {open && <NotificationPanel items={items} />}
    </div>
  );
}
