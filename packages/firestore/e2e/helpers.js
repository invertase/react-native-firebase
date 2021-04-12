/* eslint-disable no-console */
const { getE2eTestProject, getE2eEmulatorHost } = require('../../app/e2e/helpers');

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
const http = require('http');

exports.wipe = async function wipe(debug = false) {
  const deleteOptions = {
    method: 'DELETE',
    headers: {
      // Undocumented, but necessary - from Emulator UI network requests
      Authorization: 'Bearer owner',
    },
    port: 8080,
    host: getE2eEmulatorHost(),
    path: '/emulator/v1/projects/' + getE2eTestProject() + '/databases/(default)/documents',
  };

  try {
    if (debug) {
      console.time('wipe');
    }
    return await new Promise((resolve, reject) => {
      const req = http.request(deleteOptions);

      req.on('error', error => reject(error));

      req.end(() => {
        if (debug) {
          console.timeEnd('wipe');
        }
        resolve();
      });
    });
  } catch (e) {
    console.error('Unable to wipe firestore:', e);
    throw e;
  }
};
