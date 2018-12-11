module.exports = function setupOkResponse(req, res, next) {
  res.ok = function ok(payload = {}) {
    return res.status(200).json({
      status: 200,
      payload,
    });
  };

  next();
};
