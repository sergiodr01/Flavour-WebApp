const { authService } = require('../container');

function login(req, res, next) {
  try {
    const { login, password } = req.body;
    const result = authService.login(login, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
