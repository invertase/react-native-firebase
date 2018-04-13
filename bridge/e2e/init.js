const detox = require('detox');
const config = require('../package.json').detox;

before(async () => {
  await detox.init(config);
});

after(async () => {
  console.log('Cleaning up...');
  await TestHelpers.firestore.cleanup();
  await detox.cleanup();
});
