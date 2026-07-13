import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMyFlavors } from '../api/flavorApi';
import { fetchSubmittedFlavors } from '../api/reviewApi';

const POLL_INTERVAL_MS = 15000;
const SEEN_STATES_KEY = 'flavour_seen_states';

function loadSeenStates() {
  const raw = localStorage.getItem(SEEN_STATES_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveSeenStates(map) {
  localStorage.setItem(SEEN_STATES_KEY, JSON.stringify(map));
}

export function useNotifications() {
  const { user } = useAuth();
  const isCustomer = user.roles.includes('customer');
  const isFlavorist = user.roles.includes('flavorist');

  const [items, setItems] = useState([]);
  const seenStatesRef = useRef(loadSeenStates());

  const poll = useCallback(async () => {
    if (isFlavorist) {
      const submitted = await fetchSubmittedFlavors();
      setItems(
        submitted.map((f) => ({
          id: f.id,
          state: f.state,
          message: `${f.label} was submitted for review`,
          link: `/review/${f.id}`,
        }))
      );
      return;
    }

    if (isCustomer) {
      const flavors = await fetchMyFlavors();
      const seen = seenStatesRef.current;
      const notifications = flavors
        .filter((f) => f.state === 'approved' || f.state === 'rejected')
        .filter((f) => seen[f.id] !== f.state)
        .map((f) => ({
          id: f.id,
          state: f.state,
          message: `${f.label} was ${f.state}`,
          link: `/flavors/${f.id}`,
        }));
      setItems(notifications);
    }
  }, [isCustomer, isFlavorist]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  const markAllAsSeen = useCallback(() => {
    if (!isCustomer) return;
    const next = { ...seenStatesRef.current };
    items.forEach((item) => {
      next[item.id] = item.state;
    });
    seenStatesRef.current = next;
    saveSeenStates(next);
    setItems([]);
  }, [isCustomer, items]);

  return { items, count: items.length, markAllAsSeen };
}
