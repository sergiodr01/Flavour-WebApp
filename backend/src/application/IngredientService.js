const IngredientPort = require('../domain/port/in/IngredientPort');

class IngredientService extends IngredientPort {
  constructor(ingredientRepository) {
    super();
    this.ingredientRepository = ingredientRepository;
  }

  listAll() {
    return this.ingredientRepository.findAll();
  }
}

module.exports = IngredientService;
