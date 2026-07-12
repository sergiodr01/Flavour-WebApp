class UserRepository {
  findByLogin(login) {
    throw new Error('UserRepository.findByLogin() must be implemented');
  }

  findById(id) {
    throw new Error('UserRepository.findById() must be implemented');
  }
}

module.exports = UserRepository;
