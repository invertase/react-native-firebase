global.A2A = require('a2a');
global.__DEV__ = process.env.NODE_ENV !== 'production';

const app = require('express')();
const server = require('http').Server(app);

const port = __DEV__ ? 1337 : 8080;
const router = require('./router');
const services = require('./services');

process.once('SIGINT', services.destroy);
process.once('SIGTERM', services.destroy);
process.on('unhandledRejection', error => {
  if (global.log) Log.error(error);
  // eslint-disable-next-line no-console
  else console.error(error);
  services.destroy();
});

(async () => {
  await services.initialize();
  await router.initialize(app);
  server.listen(port);
  Log.info(`listening at http://localhost:${port}`);
})();
