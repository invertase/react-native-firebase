module.exports = function setupBadRequestResponse(req, res, next) {
  res.badRequest = function badRequest(error) {
    return res.status(400).json({
      status: 400,
      error: error ? error.message : 'The request was rejected due to bad syntax.',
    });
  };

  next();
};
