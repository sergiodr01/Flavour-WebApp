import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFlavorById } from '../../api/flavorApi';
import ApproveRejectButtons from '../../components/review/ApproveRejectButtons';
import CommentSection from '../../components/review/CommentSection';

const STATE_COLORS = {
  new: '#6b7280',
  submitted: '#b45309',
  approved: '#15803d',
  rejected: '#b91c1c',
};

export default function ReviewFlavorPage() {
  const { id } = useParams();
  const [flavor, setFlavor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFlavorById(id)
      .then(setFlavor)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading flavor...</p>;
  if (!flavor) return <p>Flavor not found.</p>;

  return (
    <div>
      <p>
        <Link to="/review">&larr; Back to Submitted Flavors</Link>
      </p>
      <h2>
        {flavor.label}{' '}
        <span style={{ color: STATE_COLORS[flavor.state], fontSize: '1rem' }}>[{flavor.state}]</span>
      </h2>
      <p style={{ color: '#666' }}>
        {flavor.name} · version {flavor.version}
      </p>
      {flavor.description && <p>{flavor.description}</p>}

      <h3>Ingredients</h3>
      <ul>
        {flavor.ingredients.map((fi) => (
          <li key={fi.ingredientId}>
            {fi.ingredient?.label ?? `Ingredient #${fi.ingredientId}`}: {Math.round(fi.percent * 100)}%
          </li>
        ))}
      </ul>

      {flavor.state === 'submitted' && <ApproveRejectButtons flavorId={flavor.id} onResolved={setFlavor} />}

      <CommentSection flavorId={flavor.id} canAddComment={flavor.state === 'submitted'} />
    </div>
  );
}
