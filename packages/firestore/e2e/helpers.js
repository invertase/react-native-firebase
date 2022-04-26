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

exports.BUNDLE_QUERY_NAME = 'named-bundle-test';
exports.BUNDLE_COLLECTION = 'firestore-bundle-tests';

exports.getBundle = function getBundle() {
  // Original source: http://api.rnfirebase.io/firestore/bundle
  const content = `
    151{"metadata":{"id":"firestore-bundle-tests","createTime":{"seconds":"1621252690","n
    anos":143267000},"version":1,"totalDocuments":6,"totalBytes":"3500"}}265{"namedQuery"
    :{"name":"named-bundle-test","bundledQuery":{"parent":"projects/react-native-firebase
    -testing/databases/(default)/documents","structuredQuery":{"from":[{"collectionId":"f
    irestore-bundle-tests"}]}},"readTime":{"seconds":"1621252690","nanos":143267000}}}244
    {"documentMetadata":{"name":"projects/react-native-firebase-testing/databases/(defaul
    t)/documents/firestore-bundle-tests/8I4LbBaQBgOQpbiw3BA6","readTime":{"seconds":"16
    21252690","nanos":143267000},"exists":true,"queries":["named-bundle-test"]}}287{"do
    cument":{"name":"projects/react-native-firebase-testing/databases/(default)/documen
    ts/firestore-bundle-tests/8I4LbBaQBgOQpbiw3BA6","fields":{"number":{"integerValue":
    "1"}},"createTime":{"seconds":"1621252690","nanos":90568000},"updateTime":{"seconds
    ":"1621252690","nanos":90568000}}}244{"documentMetadata":{"name":"projects/react-na
    tive-firebase-testing/databases/(default)/documents/firestore-bundle-tests/IGQgUS2i
    OfxbiEjPwU79","readTime":{"seconds":"1621252690","nanos":143267000},"exists":true,"
    queries":["named-bundle-test"]}}289{"document":{"name":"projects/react-native-fireb
    ase-testing/databases/(default)/documents/firestore-bundle-tests/IGQgUS2iOfxbiEjPwU
    79","fields":{"number":{"integerValue":"2"}},"createTime":{"seconds":"1621252690","
    nanos":103781000},"updateTime":{"seconds":"1621252690","nanos":103781000}}}244{"doc
    umentMetadata":{"name":"projects/react-native-firebase-testing/databases/(default)/
    documents/firestore-bundle-tests/IfIlAnixFCuxKJfjgU8R","readTime":{"seconds":"16212
    52690","nanos":143267000},"exists":true,"queries":["named-bundle-test"]}}289{"docum
    ent":{"name":"projects/react-native-firebase-testing/databases/(default)/documents/
    firestore-bundle-tests/IfIlAnixFCuxKJfjgU8R","fields":{"number":{"integerValue":"3"
    }},"createTime":{"seconds":"1621252690","nanos":107789000},"updateTime":{"seconds":"1
    621252690","nanos":107789000}}}244{"documentMetadata":{"name":"projects/react-native-
    firebase-testing/databases/(default)/documents/firestore-bundle-tests/2QXGhtR75xCpN3k
    p1Uup","readTime":{"seconds":"1621252690","nanos":143267000},"exists":true,"queries":
    ["named-bundle-test"]}}289{"document":{"name":"projects/react-native-firebase-testing
    /databases/(default)/documents/firestore-bundle-tests/2QXGhtR75xCpN3kp1Uup","fields":
    {"number":{"integerValue":"2"}},"createTime":{"seconds":"1621250323","nanos":16629300
    0},"updateTime":{"seconds":"1621250323","nanos":166293000}}}244{"documentMetadata":{"
    name":"projects/react-native-firebase-testing/databases/(default)/documents/firestore
    -bundle-tests/gwuvIm5uXGRk1jZGdsvP","readTime":{"seconds":"1621252690","nanos":143267
    000},"exists":true,"queries":["named-bundle-test"]}}289{"document":{"name":"projects/
    react-native-firebase-testing/databases/(default)/documents/firestore-bundle-tests/gw
    uvIm5uXGRk1jZGdsvP","fields":{"number":{"integerValue":"1"}},"createTime":{"seconds":
    "1621250323","nanos":125981000},"updateTime":{"seconds":"1621250323","nanos":12598100
    0}}}244{"documentMetadata":{"name":"projects/react-native-firebase-testing/databases/
    (default)/documents/firestore-bundle-tests/yDtWms0n3845bs5CAyEu","readTime":{"seconds
    ":"1621252690","nanos":143267000},"exists":true,"queries":["named-bundle-test"]}}289{
    "document":{"name":"projects/react-native-firebase-testing/databases/(default)/docu
    ments/firestore-bundle-tests/yDtWms0n3845bs5CAyEu","fields":{"number":{"integerValu
    e":"3"}},"createTime":{"seconds":"1621250323","nanos":170451000},"updateTime":{"sec
    onds":"1621250323","nanos":170451000}}}
  `;
  return content.replace(/(\r\n|\n|\r|\s)/gm, '');
};
