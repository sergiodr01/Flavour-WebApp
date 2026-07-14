const { flavorService } = require('../container');

function create(req, res, next) {
  try {
    const flavor = flavorService.create({ ...req.body, createdById: req.user.id });
    res.status(201).json(flavor);
  } catch (err) {
    next(err);
  }
}

function listMine(req, res, next) {
  try {
    res.json(flavorService.getByUser(req.user.id));
  } catch (err) {
    next(err);
  }
}

function getById(req, res, next) {
  try {
    console.log(req.params);
    res.json(flavorService.getById(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

function edit(req, res, next) {
  try {
    res.json(flavorService.edit(Number(req.params.id), req.body, req.user.id));
  } catch (err) {
    next(err);
  }
}

function submit(req, res, next) {
  try {
    res.json(flavorService.submit(Number(req.params.id), req.user.id));
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listMine, getById, edit, submit };
