module.exports = function badRequest(req, res, message, props) {
  res.status(400);
  res.json({
    message: message || 'Bad Request',
    ...(props || {}),
  });
};
