import { useEffect, useState } from 'react';
import { fetchComments, addComment } from '../../api/reviewApi';

export default function CommentSection({ flavorId, canAddComment = false }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchComments(flavorId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [flavorId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const comment = await addComment(flavorId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText('');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading comments...</p>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Comments</h3>
      {comments.length === 0 && <p style={{ color: '#666' }}>No comments yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {comments.map((c) => (
          <li key={c.id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
            <p style={{ margin: 0 }}>{c.text}</p>
            <small style={{ color: '#999' }}>{c.createdAt}</small>
          </li>
        ))}
      </ul>

      {canAddComment && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave feedback for the customer..."
            style={{ width: '100%', maxWidth: 400 }}
          />
          <br />
          <button type="submit" disabled={submitting || !text.trim()}>
            {submitting ? 'Posting...' : 'Add Comment'}
          </button>
        </form>
      )}
    </div>
  );
}
