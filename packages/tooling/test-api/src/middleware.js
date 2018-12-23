const bodyParser = require('body-parser');
const cors = require('cors');

const resOk = require('./responses/ok');
const resNotFound = require('./responses/notFound');
const resBadRequest = require('./responses/badRequest');
const resServerError = require('./responses/serverError');

module.exports = function setupMiddleware(app) {
  app.use(bodyParser.json());
  app.use(
    cors({
      methods: 'GET',
    }),
  );

  app.use(resOk);
  app.use(resNotFound);
  app.use(resBadRequest);
  app.use(resServerError);
};
