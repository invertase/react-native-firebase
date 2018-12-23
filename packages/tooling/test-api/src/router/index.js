const cors = require('cors');
const bodyParser = require('body-parser');

const RESPONSE_OK = require('./responses/ok');
const RESPONSE_NOT_FOUND = require('./responses/notFound');
const RESPONSE_BAD_REQUEST = require('./responses/badRequest');
const RESPONSE_SERVER_ERROR = require('./responses/serverError');

const CONTROLLER_DEBUG = require('./controllers/debug');
const CONTROLLER_AUTH = require('./controllers/auth');
const CONTROLLER_DATABASE = require('./controllers/database');
const CONTROLLER_FIRESTORE = require('./controllers/firestore');
const CONTROLLER_MESSAGING = require('./controllers/messaging');

module.exports = {
  /** ---------------
   *     Routes
   *  --------------- */
  routes: {
    // Status endpoint for availability monitoring
    //  - additionally tests redis connectivity
    'get /status': async (req, res) => {
      const [redisError] = await A2A(RedisClient.ping());
      if (redisError) res.serverError(redisError);
      else res.ok({});
    },

    // Controllers
    ...CONTROLLER_DEBUG,
    ...CONTROLLER_AUTH,
    ...CONTROLLER_DATABASE,
    ...CONTROLLER_FIRESTORE,
    ...CONTROLLER_MESSAGING,
  },

  /** -------------------
   *   Response Helpers
   *  ----------------- */
  responses: {
    ok: RESPONSE_OK,
    notFound: RESPONSE_NOT_FOUND,
    badRequest: RESPONSE_BAD_REQUEST,
    serverError: RESPONSE_SERVER_ERROR,
  },

  /** ------------
   *   MiddleWare
   *  ----------- */
  middleware: [
    bodyParser.json(),

    cors({
      methods: 'GET',
    }),

    /**
     * User Authentication
     */
    async (req, res, next) => {
      // TODO Firebase Auth JWT from app.
      const token = req.headers.token || (req.body ? req.body.token : null);

      if (!token || token.length < 35 || token.length > 200) {
        return next();
      }

      // TODO validate jwt with firebase admin sdk
      const [validateTokenError, tokenData] = await Promise.resolve();
      if (validateTokenError) return res.badRequest(validateTokenError);

      const { uid, claims } = tokenData;
      // TODO get user from firebase admin sdk
      req.user = {};
      req.jwt = token;

      delete req.params.token;
      if (req.body) delete req.body.token;

      return next();
    },

    /**
     * Custom Responses
     */
    (req, res, next) => {
      res.ok = module.exports.responses.ok.bind(res, req, res);
      res.notFound = module.exports.responses.notFound.bind(res, req, res);
      res.badRequest = module.exports.responses.badRequest.bind(res, req, res);
      res.serverError = module.exports.responses.serverError.bind(res, req, res);
      next();
    },
  ],

  /** ------------
   *   INTERNALS
   *  ----------- */

  /**
   * Simple bootstrap of the routes defined above onto express router
   */
  initialize(expressApp) {
    const routes = Object.entries(module.exports.routes);

    // attach middleware
    module.exports.middleware.forEach(m => expressApp.use(m));

    for (let i = 0; i < routes.length; i++) {
      const [definition, handler] = routes[i];
      const [methodType, path] = definition.split(' ');
      if (typeof expressApp[methodType] === 'function') {
        expressApp[methodType](path, handler);
        Log.verbose(`[routes] '${methodType.toUpperCase()}: ${path}' (fn [${handler.name}])`);
      } else {
        Log.warn(`[routes] Unknown http type '${methodType}' for path '${path}'.`);
      }
    }

    // 404 route override
    expressApp.use((req, res) => RESPONSE_NOT_FOUND(req, res));
    // 500 route override
    // eslint-disable-next-line no-unused-vars
    expressApp.use((error, req, res, next) => RESPONSE_SERVER_ERROR(req, res, error));

    Log.verbose('[routes] All routes have been initialized.');
    return Promise.resolve();
  },
};
