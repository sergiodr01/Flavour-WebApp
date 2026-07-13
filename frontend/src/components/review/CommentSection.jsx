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
      {comments.length === 0 && <p className="empty-state">No comments yet.</p>}
      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="comment-item">
            <p>{c.text}</p>
            <span className="comment-timestamp">{c.createdAt}</span>
          </li>
        ))}
      </ul>

      {canAddComment && (
        <form onSubmit={handleSubmit}>
          <textarea
            className="form-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave feedback for the customer..."
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            {submitting ? 'Posting...' : 'Add Comment'}
          </button>
        </form>
      )}
    </div>
  );
}
