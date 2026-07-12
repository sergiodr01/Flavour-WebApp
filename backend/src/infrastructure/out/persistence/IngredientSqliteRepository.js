const db = require('./db');
const IngredientRepository = require('../../../domain/port/out/IngredientRepository');
const Ingredient = require('../../../domain/model/Ingredient');

class IngredientSqliteRepository extends IngredientRepository {
  findAll() {
    const rows = db.prepare('SELECT * FROM ingredient ORDER BY label').all();
    return rows.map((row) => this.#toDomain(row));
  }

  findByIds(ids) {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const rows = db
      .prepare(`SELECT * FROM ingredient WHERE id IN (${placeholders})`)
      .all(...ids);
    return rows.map((row) => this.#toDomain(row));
  }

  #toDomain(row) {
    return new Ingredient({
      id: row.id,
      name: row.name,
      label: row.label,
      description: row.description,
      pricePerUnit: row.price_per_unit,
      priceUnit: row.price_unit,
    });
  }
}

module.exports = IngredientSqliteRepository;
