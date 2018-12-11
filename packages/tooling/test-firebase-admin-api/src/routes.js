module.exports = function setupRoutes(app) {
  app.get('/', (req, res) => res.ok());
  app.get('*', (req, res) => res.notFound('Route not found'));
};
