module.exports = function setupNotFoundResponse(req, res, next) {
  res.notFound = function notFound(error) {
    return res.status(404).json({
      status: 404,
      error: error ? error.message : 'The request resource could not be found.',
    });
  };

  next();
};
