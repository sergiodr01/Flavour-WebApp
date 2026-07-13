function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const body = { error: err.message || 'Internal server error' };

  if (err.details) {
    body.details = err.details;
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
