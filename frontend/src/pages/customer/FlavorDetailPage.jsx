import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchFlavorById, fetchMyFlavors, editFlavor, submitFlavor } from '../../api/flavorApi';
import { fetchIngredients } from '../../api/ingredientApi';
import FlavorForm from '../../components/flavor/FlavorForm';
import VersionHistory from '../../components/flavor/VersionHistory';

const STATE_COLORS = {
  new: '#6b7280',
  submitted: '#b45309',
  approved: '#15803d',
  rejected: '#b91c1c',
};

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
        <p style={{ color: '#666' }}>Saving will create a new version (v{flavor.version + 1}).</p>
        <FlavorForm
          ingredients={ingredients}
          initialValues={flavor}
          onSubmit={handleEditSubmit}
          submitLabel="Save New Version"
        />
        <button type="button" onClick={() => setIsEditing(false)} style={{ marginTop: '0.5rem' }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/flavors">&larr; Back to My Flavors</Link>
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

      {flavor.state === 'new' && (
        <div style={{ marginTop: '1rem' }}>
          <button type="button" onClick={() => setIsEditing(true)}>
            Edit (creates new version)
          </button>{' '}
          <button type="button" onClick={handleSubmitForReview} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      )}
      {submitError && <p style={{ color: 'red' }}>{submitError}</p>}

      <VersionHistory versions={versions} currentId={flavor.id} />
    </div>
  );
}
