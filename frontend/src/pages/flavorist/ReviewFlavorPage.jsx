import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFlavorById } from '../../api/flavorApi';
import ApproveRejectButtons from '../../components/review/ApproveRejectButtons';
import CommentSection from '../../components/review/CommentSection';
import StateBadge from '../../components/common/StateBadge';

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
      <Link to="/review" className="back-link">
        &larr; Back to Submitted Flavors
      </Link>
      <h2>
        {flavor.label} <StateBadge state={flavor.state} />
      </h2>
      <p className="muted">
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

      {flavor.state === 'submitted' && (
        <div style={{ marginTop: '1rem' }}>
          <ApproveRejectButtons flavorId={flavor.id} onResolved={setFlavor} />
        </div>
      )}

      <CommentSection flavorId={flavor.id} canAddComment={flavor.state === 'submitted'} />
    </div>
  );
}
