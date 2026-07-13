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
    <div style={{ position: 'relative', display: 'inline-block', marginRight: '1rem' }}>
      <button type="button" onClick={toggle} style={{ position: 'relative' }}>
        🔔
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '0 5px',
              fontSize: '0.7rem',
            }}
          >
            {count}
          </span>
        )}
      </button>
      {open && <NotificationPanel items={items} />}
    </div>
  );
}
