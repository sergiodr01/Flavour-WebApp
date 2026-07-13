const { reviewService } = require('../container');

function getSubmitted(req, res, next) {
  try {
    res.json(reviewService.getSubmitted());
  } catch (err) {
    next(err);
  }
}

function approve(req, res, next) {
  try {
    res.json(reviewService.approve(Number(req.params.id), req.user.id));
  } catch (err) {
    next(err);
  }
}

function reject(req, res, next) {
  try {
    res.json(reviewService.reject(Number(req.params.id), req.user.id));
  } catch (err) {
    next(err);
  }
}

function addComment(req, res, next) {
  try {
    const comment = reviewService.addComment(Number(req.params.id), req.user.id, req.body.text);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

function getComments(req, res, next) {
  try {
    res.json(reviewService.getComments(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

module.exports = { getSubmitted, approve, reject, addComment, getComments };
