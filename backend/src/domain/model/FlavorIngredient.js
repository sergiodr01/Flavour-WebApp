class FlavorIngredient {
  constructor({ ingredientId, percent, ingredient = null }) {
    this.ingredientId = ingredientId;
    this.percent = percent;
    this.ingredient = ingredient; // objeto Ingredient completo, si viene enriquecido vía JOIN
  }
}

module.exports = FlavorIngredient;



