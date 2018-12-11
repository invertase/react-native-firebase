/* eslint-disable no-console */
module.exports = function setupServerErrorResponse(req, res, next) {
  res.serverError = function serverError(error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      error: error ? error.message : 'An unknown error occurred',
    });
  };

  next();
};
