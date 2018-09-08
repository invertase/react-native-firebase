const axios = require('axios');
const { sleep, getReactNativePlatform, A2A } = require('./utils');

let waitAttempts = 1;
let maxWaitAttempts = 60;

async function waitForPackager() {
  let ready = false;

  while (waitAttempts < maxWaitAttempts) {
    console.log(`Waiting for packager to be ready, attempt ${waitAttempts} of ${maxWaitAttempts}...`);
    const [error, response] = await A2A(axios.get('http://localhost:8081/status', { timeout: 500 }));
    // metro bundler only
    if (error && error.response && error.response.data && error.response.data.includes('Cannot GET /status')) {
      ready = true;
      break;
    }

    // rn-cli only
    if (!error && response.data.includes('packager-status:running')) {
      ready = true;
      break;
    }

    await sleep(1500);
    waitAttempts++;
  }

  if (!ready) {
    return Promise.reject(new Error('Packager failed to be ready.'));
  }

  console.log('Packager is now ready!');

  return true;
}

(async function main() {
  const [packagerError] = await A2A(waitForPackager());
  if (packagerError) {
    console.error(packagerError);
    process.exitCode = 1;
    process.exit();
  }

  const platform = getReactNativePlatform();
  const map = `http://localhost:8081/index.map?platform=${platform}&dev=true&minify=false&inlineSourceMap=true`;
  const bundle = `http://localhost:8081/index.bundle?platform=${platform}&dev=true&minify=false&inlineSourceMap=true`;

  console.log(`Requesting ${platform} bundle...`);
  console.log(bundle);
  const [bundleError] = await A2A(axios.get(bundle));
  if (bundleError) {
    console.error(bundleError);
    process.exitCode = 1;
    process.exit();
  }

  console.log(`Requesting ${platform} bundle source map...`);
  console.log(map);
  const [bundleMapError] = await A2A(axios.get(map));
  if (bundleMapError) {
    console.error(bundleMapError);
    process.exitCode = 1;
    process.exit();
  }

  console.log('Warm-up complete!')
})();

