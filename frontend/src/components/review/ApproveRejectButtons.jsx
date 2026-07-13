import { useState } from 'react';
import { approveFlavor, rejectFlavor } from '../../api/reviewApi';

export default function ApproveRejectButtons({ flavorId, onResolved }) {
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handle(action) {
    setError(null);
    setSubmitting(true);
    try {
      const updated = action === 'approve' ? await approveFlavor(flavorId) : await rejectFlavor(flavorId);
      onResolved(updated);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Action failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={() => handle('approve')} disabled={submitting} style={{ color: 'green' }}>
        Approve
      </button>{' '}
      <button type="button" onClick={() => handle('reject')} disabled={submitting} style={{ color: 'red' }}>
        Reject
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
