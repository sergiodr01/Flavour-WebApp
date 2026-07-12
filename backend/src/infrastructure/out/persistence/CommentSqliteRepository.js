const db = require('./db');
const CommentRepository = require('../../../domain/port/out/CommentRepository');
const Comment = require('../../../domain/model/Comment');

class CommentSqliteRepository extends CommentRepository {
  save(comment) {
    const stmt = db.prepare(`
      INSERT INTO comment (text, flavor_id, created_by_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(comment.text, comment.flavorId, comment.createdById, comment.createdAt);

    return new Comment({
      id: result.lastInsertRowid,
      text: comment.text,
      flavorId: comment.flavorId,
      createdById: comment.createdById,
      createdAt: comment.createdAt,
    });
  }

  findByFlavorId(flavorId) {
    const rows = db
      .prepare('SELECT * FROM comment WHERE flavor_id = ? ORDER BY created_at')
      .all(flavorId);
    return rows.map((row) => this.#toDomain(row));
  }

  #toDomain(row) {
    return new Comment({
      id: row.id,
      text: row.text,
      flavorId: row.flavor_id,
      createdById: row.created_by_id,
      createdAt: row.created_at,
    });
  }
}

module.exports = CommentSqliteRepository;
