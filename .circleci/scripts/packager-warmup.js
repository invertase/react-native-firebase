/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const axios = require('axios');
const { sleep, getReactNativePlatform, A2A } = require('./utils');

let waitAttempts = 1;
let maxWaitAttempts = 60;
const port = process.env.RCT_METRO_PORT || 8081;

async function waitForPackager() {
  let ready = false;

  while (waitAttempts < maxWaitAttempts) {
    console.log(`Waiting for packager to be ready, attempt ${waitAttempts} of ${maxWaitAttempts}...`);
    const [error, response] = await A2A(axios.get(`http://localhost:${port}/status`, { timeout: 500 }));
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
  const map = `http://localhost:${port}/index.map?platform=${platform}&dev=true&minify=false&inlineSourceMap=true`;
  const bundle = `http://localhost:${port}/index.bundle?platform=${platform}&dev=true&minify=false&inlineSourceMap=true`;

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
