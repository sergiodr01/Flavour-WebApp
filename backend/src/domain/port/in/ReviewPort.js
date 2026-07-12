class ReviewPort {
  getSubmitted() {
    throw new Error('ReviewPort.getSubmitted() must be implemented');
  }

  approve(flavorId, flavoristId) {
    throw new Error('ReviewPort.approve() must be implemented');
  }

  reject(flavorId, flavoristId) {
    throw new Error('ReviewPort.reject() must be implemented');
  }

  addComment(flavorId, userId, text) {
    throw new Error('ReviewPort.addComment() must be implemented');
  }

  getComments(flavorId) {
    throw new Error('ReviewPort.getComments() must be implemented');
  }
}

module.exports = ReviewPort;
