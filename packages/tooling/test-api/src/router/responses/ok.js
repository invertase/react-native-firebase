module.exports = function ok(req, res, props, message) {
  res.status(200);
  res.json({
    message: message || 'OK',
    ...(props || {}),
  });
};
