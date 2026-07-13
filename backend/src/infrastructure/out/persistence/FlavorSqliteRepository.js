const db = require('./db');
const FlavorRepository = require('../../../domain/port/out/FlavorRepository');
const Flavor = require('../../../domain/model/Flavor');
const FlavorIngredient = require('../../../domain/model/FlavorIngredient');
const Ingredient = require('../../../domain/model/Ingredient');

class FlavorSqliteRepository extends FlavorRepository {
  save(flavor) {
    const insertFlavor = db.prepare(`
      INSERT INTO flavor (name, label, description, created_by_id, approved_by_id, state, version, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertIngredient = db.prepare(`
      INSERT INTO flavor_ingredient_map (flavor_id, ingredient_id, percent)
      VALUES (?, ?, ?)
    `);

    db.exec('BEGIN');
    try {
      const result = insertFlavor.run(
        flavor.name,
        flavor.label ?? null,
        flavor.description ?? null,
        flavor.createdById,
        flavor.approvedById ?? null,
        flavor.state,
        flavor.version,
        flavor.createdAt
      );
      const flavorId = result.lastInsertRowid;

      for (const fi of flavor.ingredients) {
        insertIngredient.run(flavorId, fi.ingredientId, fi.percent);
      }

      db.exec('COMMIT');
      return this.findById(flavorId);
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  findById(id) {
    const row = db.prepare('SELECT * FROM flavor WHERE id = ?').get(id);
    if (!row) return null;
    return this.#toDomain(row);
  }

  findByCreatedBy(userId) {
    const rows = db
      .prepare('SELECT * FROM flavor WHERE created_by_id = ? ORDER BY name, version')
      .all(userId);
    return rows.map((row) => this.#toDomain(row));
  }

  findByState(state) {
    const rows = db
      .prepare('SELECT * FROM flavor WHERE state = ? ORDER BY created_at')
      .all(state);
    return rows.map((row) => this.#toDomain(row));
  }

  findByName(name, createdById) {
    const rows = db
      .prepare('SELECT * FROM flavor WHERE name = ? AND created_by_id = ? ORDER BY version DESC')
      .all(name, createdById);
    return rows.map((row) => this.#toDomain(row));
  }

  findAll() {
    const rows = db.prepare('SELECT * FROM flavor ORDER BY name, version').all();
    return rows.map((row) => this.#toDomain(row));
  }

  updateState(id, { state, approvedById = null }) {
    db.prepare('UPDATE flavor SET state = ?, approved_by_id = ? WHERE id = ?').run(
      state,
      approvedById,
      id
    );
    return this.findById(id);
  }

  #toDomain(row) {
    const ingredientRows = db
      .prepare(
        `SELECT fim.ingredient_id, fim.percent,
                i.id as ing_id, i.name, i.label, i.description, i.price_per_unit, i.price_unit
         FROM flavor_ingredient_map fim
         JOIN ingredient i ON i.id = fim.ingredient_id
         WHERE fim.flavor_id = ?`
      )
      .all(row.id);

    const ingredients = ingredientRows.map(
      (ir) =>
        new FlavorIngredient({
          ingredientId: ir.ingredient_id,
          percent: ir.percent,
          ingredient: new Ingredient({
            id: ir.ing_id,
            name: ir.name,
            label: ir.label,
            description: ir.description,
            pricePerUnit: ir.price_per_unit,
            priceUnit: ir.price_unit,
          }),
        })
    );

    return new Flavor({
      id: row.id,
      name: row.name,
      label: row.label,
      description: row.description,
      createdById: row.created_by_id,
      approvedById: row.approved_by_id,
      state: row.state,
      version: row.version,
      createdAt: row.created_at,
      ingredients,
    });
  }
}

module.exports = FlavorSqliteRepository;
