class Comment {
  constructor({ id, text, flavorId, createdById, createdAt }) {
    this.id = id;
    this.text = text;
    this.flavorId = flavorId;
    this.createdById = createdById;
    this.createdAt = createdAt;
  }
}

module.exports = Comment;
