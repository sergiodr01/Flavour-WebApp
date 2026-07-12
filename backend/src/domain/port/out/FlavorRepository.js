class FlavorRepository {
  save(flavor) {
    throw new Error('FlavorRepository.save() must be implemented');
  }

  findById(id) {
    throw new Error('FlavorRepository.findById() must be implemented');
  }

  findByCreatedBy(userId) {
    throw new Error('FlavorRepository.findByCreatedBy() must be implemented');
  }

  findByState(state) {
    throw new Error('FlavorRepository.findByState() must be implemented');
  }

  findByName(name) {
    throw new Error('FlavorRepository.findByName() must be implemented');
  }

  findAll() {
    throw new Error('FlavorRepository.findAll() must be implemented');
  }

  updateState(id, { state, approvedById }) {
    throw new Error('FlavorRepository.updateState() must be implemented');
  }
}

module.exports = FlavorRepository;
