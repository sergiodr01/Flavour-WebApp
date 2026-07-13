const ReviewPort = require('../domain/port/in/ReviewPort');
const FlavorState = require('../domain/model/FlavorState');
const Comment = require('../domain/model/Comment');
const formatTimestamp = require('../shared/formatTimestamp');

class ReviewService extends ReviewPort {
  constructor(flavorRepository, commentRepository) {
    super();
    this.flavorRepository = flavorRepository;
    this.commentRepository = commentRepository;
  }

  getSubmitted() {
    return this.flavorRepository.findByState(FlavorState.SUBMITTED);
  }

  approve(flavorId, flavoristId) {
    return this.#resolve(flavorId, flavoristId, FlavorState.APPROVED);
  }

  reject(flavorId, flavoristId) {
    return this.#resolve(flavorId, flavoristId, FlavorState.REJECTED);
  }

  addComment(flavorId, userId, text) {
    const flavor = this.flavorRepository.findById(flavorId);
    if (!flavor) {
      this.#throwNotFound();
    }

    if (typeof text !== 'string' || !text.trim()) {
      const error = new Error('Comment text is required');
      error.statusCode = 400;
      throw error;
    }

    return this.commentRepository.save(
      new Comment({
        text: text.trim(),
        flavorId,
        createdById: userId,
        createdAt: formatTimestamp(),
      })
    );
  }

  getComments(flavorId) {
    return this.commentRepository.findByFlavorId(flavorId);
  }

  #resolve(flavorId, flavoristId, newState) {
    const flavor = this.flavorRepository.findById(flavorId);
    if (!flavor) {
      this.#throwNotFound();
    }

    if (!flavor.canBeReviewed()) {
      const error = new Error('Flavor cannot be reviewed in its current state');
      error.statusCode = 409;
      throw error;
    }

    return this.flavorRepository.updateState(flavorId, {
      state: newState,
      approvedById: flavoristId,
    });
  }

  #throwNotFound() {
    const error = new Error('Flavor not found');
    error.statusCode = 404;
    throw error;
  }
}

module.exports = ReviewService;
