import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchFlavorById, fetchMyFlavors, editFlavor, submitFlavor } from '../../api/flavorApi';
import { fetchIngredients } from '../../api/ingredientApi';
import FlavorForm from '../../components/flavor/FlavorForm';
import VersionHistory from '../../components/flavor/VersionHistory';
import StateBadge from '../../components/common/StateBadge';

export default function FlavorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flavor, setFlavor] = useState(null);
  const [versions, setVersions] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setIsEditing(false);
    Promise.all([fetchFlavorById(id), fetchIngredients(), fetchMyFlavors()]).then(
      ([flavorData, ingredientsData, myFlavors]) => {
        setFlavor(flavorData);
        setIngredients(ingredientsData);
        setVersions(
          myFlavors.filter((f) => f.name === flavorData.name).sort((a, b) => b.version - a.version)
        );
      }
    ).finally(() => setLoading(false));
  }, [id]);

  async function handleEditSubmit(payload) {
    const updated = await editFlavor(flavor.id, payload);
    navigate(`/flavors/${updated.id}`, { replace: true });
  }

  async function handleSubmitForReview() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const updated = await submitFlavor(flavor.id);
      setFlavor(updated);
    } catch (err) {
      setSubmitError(err.response?.data?.error ?? 'Could not submit flavor');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading flavor...</p>;
  if (!flavor) return <p>Flavor not found.</p>;

  if (isEditing) {
    return (
      <div>
        <h2>Edit {flavor.label}</h2>
        <p className="form-hint">Saving will create a new version (v{flavor.version + 1}).</p>
        <FlavorForm
          ingredients={ingredients}
          initialValues={flavor}
          onSubmit={handleEditSubmit}
          submitLabel="Save New Version"
        />
        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link to="/flavors" className="back-link">
        &larr; Back to My Flavors
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

      {flavor.state === 'new' && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="button" onClick={() => setIsEditing(true)} className="btn btn-secondary">
            Edit (creates new version)
          </button>
          <button type="button" onClick={handleSubmitForReview} disabled={submitting} className="btn btn-primary">
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      )}
      {submitError && <p className="form-error">{submitError}</p>}

      <VersionHistory versions={versions} currentId={flavor.id} />
    </div>
  );
}
