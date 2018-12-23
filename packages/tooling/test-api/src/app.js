/* eslint-disable no-console */
const express = require('express');
const Redibox = require('redibox').default;

const config = require('./config');
const routes = require('./routes');
const middleware = require('./middleware');

const app = express();

middleware(app);
routes(app);

const port = process.env.PORT || 8080;
const redibox = new Redibox({
  redis: {
    host: config.redis.host,
    password: config.redis.password,
    port: config.redis.port,
  },
});

(async function bootstrap() {
  redibox.on('ready', () => {
    global.Cache = redibox.hooks.cache;
    console.log('Redibox connected');
    app.listen(port, () => console.log(`Listening on port http://localhost:${port}!`));
  });

  redibox.on('error', error => {
    redibox.log.error(error);
    process.exit(1);
  });
})();
