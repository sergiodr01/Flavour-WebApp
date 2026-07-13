const { ingredientService } = require('../container');

function listAll(req, res, next) {
  try {
    res.json(ingredientService.listAll());
  } catch (err) {
    next(err);
  }
}

module.exports = { listAll };
