const RediBox = require('redibox').default;
const { clientConfig, scripts } = require('./../config/redis').redis;

let ready = false;
let instance = null;

module.exports = {
  name: 'redis',
  get instance() {
    return instance;
  },

  async initialize() {
    if (instance && ready) return module.exports;
    if (!instance) instance = new RediBox(clientConfig);

    // setup lua scripts
    if (scripts) {
      instance.defineLuaCommands(scripts, instance.clients.default);
    }

    await new Promise(resolve => instance.once('ready', resolve));

    ready = true;
    global.Redis = instance;
    global.Cache = instance.hooks.cache;
    global.RedisClient = instance.clients.default;
    return module.exports;
  },

  destroy() {
    if (instance) {
      instance.disconnect();
      instance = null;
      delete global.Cache;
      delete global.Redis;
      delete global.RedisClient;
    }
  },
};
