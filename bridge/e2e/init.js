const detox = require('detox');
const config = require('../package.json').detox;
require('./../helpers');

before(async () => {
  await detox.init(config);
});

after(async () => {
  await detox.cleanup();
});
