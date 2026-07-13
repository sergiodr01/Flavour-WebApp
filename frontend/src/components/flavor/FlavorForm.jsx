import { useState } from 'react';
import IngredientPicker from './IngredientPicker';

export default function FlavorForm({ ingredients, initialValues, onSubmit, submitLabel = 'Create Flavor' }) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [label, setLabel] = useState(initialValues?.label ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [flavorIngredients, setFlavorIngredients] = useState(
    initialValues?.ingredients?.map((fi) => ({ ingredientId: fi.ingredientId, percent: fi.percent })) ?? []
  );
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const lockName = Boolean(initialValues);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, label, description, ingredients: flavorIngredients });
    } catch (err) {
      const details = err.response?.data?.details;
      const message = err.response?.data?.error ?? 'Something went wrong';
      setError(details ? `${message}: ${details.join(', ')}` : message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <div>
        <label>Name (internal identifier)</label>
        <br />
        <input value={name} onChange={(e) => setName(e.target.value)} required disabled={lockName} />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <label>Label</label>
        <br />
        <input value={label} onChange={(e) => setLabel(e.target.value)} required />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <label>Description</label>
        <br />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <h3 style={{ marginTop: '1rem' }}>Ingredients (up to 5, 5% increments, must total 100%)</h3>
      <IngredientPicker ingredients={ingredients} value={flavorIngredients} onChange={setFlavorIngredients} />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={submitting} style={{ marginTop: '1rem' }}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
