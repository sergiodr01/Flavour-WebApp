const db = require('./db');
const UserRepository = require('../../../domain/port/out/UserRepository');
const User = require('../../../domain/model/User');

class UserSqliteRepository extends UserRepository {
  findByLogin(login) {
    const row = db.prepare('SELECT * FROM user WHERE login = ?').get(login);
    if (!row) return null;
    return this.#toDomain(row);
  }

  findById(id) {
    const row = db.prepare('SELECT * FROM user WHERE id = ?').get(id);
    if (!row) return null;
    return this.#toDomain(row);
  }

  #toDomain(row) {
    const roles = db
      .prepare(
        `SELECT ur.name
         FROM user_role_map urm
         JOIN user_role ur ON ur.id = urm.user_role_id
         WHERE urm.user_id = ?`
      )
      .all(row.id)
      .map((r) => r.name);

    return new User({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      login: row.login,
      roles,
    });
  }
}

module.exports = UserSqliteRepository;
