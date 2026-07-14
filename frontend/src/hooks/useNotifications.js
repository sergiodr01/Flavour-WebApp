import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMyFlavors } from '../api/flavorApi';
import { fetchSubmittedFlavors, fetchComments } from '../api/reviewApi';

const POLL_INTERVAL_MS = 15000;
const STORAGE_KEY_PREFIX = 'flavour_notifications';
const MAX_OLD_SHOWN = 3;

function loadNotifications(userId) {
  const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${userId}`);
  return raw ? JSON.parse(raw) : [];
}

function saveNotifications(userId, list) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}_${userId}`, JSON.stringify(list));
}

async function buildCommentPreview(flavorId) {
  try {
    const comments = await fetchComments(flavorId);
    if (comments.length === 0) return '';
    const last = comments[comments.length - 1];
    return last.text.length > 60 ? `${last.text.slice(0, 60)}…` : last.text;
  } catch {
    return '';
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const isCustomer = user.roles.includes('customer');
  const isFlavorist = user.roles.includes('flavorist');

  const [notifications, setNotifications] = useState(() => loadNotifications(user.id));
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const poll = useCallback(async () => {
    const existing = notificationsRef.current;
    const existingFlavorIds = new Set(existing.map((n) => n.flavorId));
    const newOnes = [];

    if (isCustomer) {
      const flavors = await fetchMyFlavors();
      for (const f of flavors) {
        if ((f.state === 'approved' || f.state === 'rejected') && !existingFlavorIds.has(f.id)) {
          const preview = await buildCommentPreview(f.id);
          newOnes.push({
            flavorId: f.id,
            message: preview ? `${f.label} was ${f.state} — "${preview}"` : `${f.label} was ${f.state}`,
            link: `/flavors/${f.id}`,
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }

    if (isFlavorist) {
      const submitted = await fetchSubmittedFlavors();
      for (const f of submitted) {
        if (!existingFlavorIds.has(f.id)) {
          newOnes.push({
            flavorId: f.id,
            message: `${f.label} was submitted for review`,
            link: `/review/${f.id}`,
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }

    if (newOnes.length > 0) {
      const merged = [...newOnes, ...existing];
      notificationsRef.current = merged;
      setNotifications(merged);
      saveNotifications(user.id, merged);
    }
  }, [isCustomer, isFlavorist, user.id]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  const markAllAsSeen = useCallback(() => {
    const updated = notificationsRef.current.map((n) => (n.read ? n : { ...n, read: true }));
    notificationsRef.current = updated;
    setNotifications(updated);
    saveNotifications(user.id, updated);
  }, [user.id]);

  const unread = notifications.filter((n) => !n.read);
  const old = notifications
    .filter((n) => n.read)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_OLD_SHOWN);

  return { unread, old, count: unread.length, markAllAsSeen };
}
