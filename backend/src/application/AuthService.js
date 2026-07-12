const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthPort = require('../domain/port/in/AuthPort');

const MD5_HASH_PATTERN = /^[a-f0-9]{32}$/i;

class AuthService extends AuthPort {
  constructor(userRepository) {
    super();
    this.userRepository = userRepository;
  }

  login(login, password) {
    const credentials = this.userRepository.findCredentialsByLogin(login);

    if (!credentials || !this.#verifyPassword(password, credentials.passwordHash)) {
      const error = new Error('Invalid login or password');
      error.statusCode = 401;
      throw error;
    }

    const user = this.userRepository.findById(credentials.id);

    const token = jwt.sign(
      { sub: user.id, login: user.login, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return { user, token };
  }

  #verifyPassword(plain, storedHash) {
    if (MD5_HASH_PATTERN.test(storedHash)) {
      const legacyHash = crypto.createHash('md5').update(plain).digest('hex');
      return legacyHash === storedHash;
    }
    return bcrypt.compareSync(plain, storedHash);
  }
}

module.exports = AuthService;
