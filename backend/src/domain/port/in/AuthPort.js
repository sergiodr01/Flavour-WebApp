class AuthPort {
  login(login, password) {
    throw new Error('AuthPort.login() must be implemented');
  }
}

module.exports = AuthPort;
