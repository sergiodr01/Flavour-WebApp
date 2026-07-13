class FlavorPort {
  create(data) {
    throw new Error('FlavorPort.create() must be implemented');
  }

  getById(id) {
    throw new Error('FlavorPort.getById() must be implemented');
  }

  getByUser(userId) {
    throw new Error('FlavorPort.getByUser() must be implemented');
  }

  edit(id, data, userId) {
    throw new Error('FlavorPort.edit() must be implemented');
  }

  submit(id, userId) {
    throw new Error('FlavorPort.submit() must be implemented');
  }

  listAll() {
    throw new Error('FlavorPort.listAll() must be implemented');
  }
}

module.exports = FlavorPort;
