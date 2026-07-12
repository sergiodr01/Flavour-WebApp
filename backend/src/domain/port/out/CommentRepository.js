class CommentRepository {
  save(comment) {
    throw new Error('CommentRepository.save() must be implemented');
  }

  findByFlavorId(flavorId) {
    throw new Error('CommentRepository.findByFlavorId() must be implemented');
  }
}

module.exports = CommentRepository;
