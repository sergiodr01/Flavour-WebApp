const { ingredientService } = require('../container');

function listAll(req, res, next) {
  console.log("Im in the infrastructure in layer")
  try {
    res.json(ingredientService.listAll());
  } catch (err) {
    next(err);
  }
}

module.exports = { listAll };
