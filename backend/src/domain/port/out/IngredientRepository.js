class IngredientRepository {
  findAll() {
    throw new Error('IngredientRepository.findAll() must be implemented');
  }

  findByIds(ids) {
    throw new Error('IngredientRepository.findByIds() must be implemented');
  }
}

module.exports = IngredientRepository;
