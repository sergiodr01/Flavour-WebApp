const FlavorState = require('./FlavorState');

const MAX_INGREDIENTS = 5;
const PERCENT_STEP = 0.05;
const TOTAL_PERCENT = 1.0;
const EPSILON = 0.0001; // margen para errores de redondeo en floats

class Flavor {
  constructor({
    id,
    name,
    label,
    description,
    createdById,
    approvedById = null,
    state = FlavorState.NEW,
    version = 0,
    createdAt,
    ingredients = [],
  }) {
    this.id = id;
    this.name = name;
    this.label = label;
    this.description = description;
    this.createdById = createdById;
    this.approvedById = approvedById;
    this.state = state;
    this.version = version;
    this.createdAt = createdAt;
    this.ingredients = ingredients;
  }

  validateIngredients() {
    const errors = [];

    if (this.ingredients.length === 0) {
      errors.push('A flavor must have at least 1 ingredient.');
    }

    if (this.ingredients.length > MAX_INGREDIENTS) {
      errors.push(`A flavor cannot have more than ${MAX_INGREDIENTS} ingredients.`);
    }

    for (const fi of this.ingredients) {
      const steps = fi.percent / PERCENT_STEP;
      if (Math.abs(Math.round(steps) - steps) > EPSILON) {
        errors.push(
          `Ingredient percent (${fi.percent}) must be in increments of ${PERCENT_STEP * 100}%.`
        );
      }
    }

    const total = this.ingredients.reduce((sum, fi) => sum + fi.percent, 0);
    if (Math.abs(total - TOTAL_PERCENT) > EPSILON) {
      errors.push(`Ingredient percentages must total 100% (currently ${(total * 100).toFixed(2)}%).`);
    }

    return errors;
  }

  isEditable() {
    return this.state === FlavorState.NEW;
  }

  isSubmittable() {
    return this.state === FlavorState.NEW && this.validateIngredients().length === 0;
  }

  canBeReviewed() {
    return this.state === FlavorState.SUBMITTED;
  }
}

module.exports = Flavor;
