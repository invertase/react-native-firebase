const detox = require('detox');
const config = require('../package.json').detox;

/*
Example showing how to use Detox with required objects rather than globally exported.
e.g `const {device, expect, element, by, waitFor} = require('detox');`
 */
before(async () => {
  await detox.init(config, {initGlobals: false});
});

after(async () => {
  await detox.cleanup();
});
