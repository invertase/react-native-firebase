const { instance: Log } = require('./log');
const { asyncIterable } = require('./../utils');

const services = [
  require('./log'),
  require('./redis'),
];

module.exports = {
  async initialize() {
    // eslint-disable-next-line no-restricted-syntax
    for await (const service of asyncIterable(
      services.map(s => s.initialize())
    )) {
      Log.verbose(`[services] ${service.name} initialized and ready.`);
    }

    Log.verbose('[services] All services have been initialized.');
  },

  destroy() {
    Log.warn('Destroying services..');
    services.forEach(s => s.destroy());
    process.exit();
  },
};
