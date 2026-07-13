import { useMemo } from 'react';

const PERCENT_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5); // 5,10,...,100
const MAX_INGREDIENTS = 5;

export default function IngredientPicker({ ingredients, value, onChange, disabled = false }) {
  const total = useMemo(() => value.reduce((sum, row) => sum + row.percent, 0), [value]);
  const totalPercent = Math.round(total * 100);
  const isComplete = Math.abs(total - 1) < 0.0001;

  const usedIds = new Set(value.map((row) => row.ingredientId));

  function updateRow(index, changes) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  }

  function addRow() {
    const firstAvailable = ingredients.find((ing) => !usedIds.has(ing.id));
    if (!firstAvailable) return;
    onChange([...value, { ingredientId: firstAvailable.id, percent: 0.05 }]);
  }

  function removeRow(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      {value.map((row, index) => {
        const availableForRow = ingredients.filter(
          (ing) => ing.id === row.ingredientId || !usedIds.has(ing.id)
        );
        return (
          <div key={index} className="ingredient-row">
            <select
              className="form-select"
              value={row.ingredientId}
              disabled={disabled}
              onChange={(e) => updateRow(index, { ingredientId: Number(e.target.value) })}
            >
              {availableForRow.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.label}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={Math.round(row.percent * 100)}
              disabled={disabled}
              onChange={(e) => updateRow(index, { percent: Number(e.target.value) / 100 })}
            >
              {PERCENT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}%
                </option>
              ))}
            </select>
            {!disabled && (
              <button type="button" onClick={() => removeRow(index)} className="btn btn-danger">
                Remove
              </button>
            )}
          </div>
        );
      })}

      {!disabled && value.length < MAX_INGREDIENTS && (
        <button
          type="button"
          onClick={addRow}
          disabled={usedIds.size >= ingredients.length}
          className="btn btn-secondary"
        >
          + Add ingredient
        </button>
      )}

      <p className={`ingredient-total ${isComplete ? 'is-complete' : 'is-incomplete'}`}>
        Total: {totalPercent}% {isComplete ? '✓' : '(must equal 100%)'}
      </p>
    </div>
  );
}
