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
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label">Name (internal identifier)</label>
        <input
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={lockName}
        />
      </div>
      <div className="form-field">
        <label className="form-label">Label</label>
        <input className="form-input" value={label} onChange={(e) => setLabel(e.target.value)} required />
      </div>
      <div className="form-field">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <h3>Ingredients</h3>
      <p className="form-hint">Up to 5, in 5% increments, must total 100%.</p>
      <IngredientPicker ingredients={ingredients} value={flavorIngredients} onChange={setFlavorIngredients} />

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '1rem' }}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
