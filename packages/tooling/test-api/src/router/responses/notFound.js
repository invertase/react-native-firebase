module.exports = function notFound(req, res, message, props) {
  res.status(404);
  res.json({
    message: message || 'Not Found',
    ...(props || {}),
  });
};
