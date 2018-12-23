module.exports = function serverError(req, res, error, message) {
  res.status(500);
  if (error) Log.error(error);
  res.json({
    message: message || 'Internal Server Error',
    ...(error ? { error: error.message } : {}),
  });
};
