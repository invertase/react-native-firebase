const detox = require('detox');
const config = require('../package.json').detox;

before(async () => {
  await detox.init(config);
  // needs to be called before any usage of firestore
  // await firebase.firestore().settings({ persistence: true });
  // await firebase.firestore().settings({ persistence: false });
});

after(async () => {
  console.log('Cleaning up...');
  await TestHelpers.firestore.cleanup();
  console.log('Firestore cleaned up...');
  // await detox.cleanup(); // TODO hangs - most likely jet internals interfering
  console.log('Detox cleaned up...');
});
