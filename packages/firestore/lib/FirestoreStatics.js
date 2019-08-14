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

import { NativeModules } from 'react-native';
import FirestoreBlob from './FirestoreBlob';
import FirestoreFieldPath from './FirestoreFieldPath';
import FirestoreFieldValue from './FirestoreFieldValue';
import FirestoreGeoPoint from './FirestoreGeoPoint';
import FirestoreTimestamp from './FirestoreTimestamp';

export default {
  Blob: FirestoreBlob,
  FieldPath: FirestoreFieldPath,
  FieldValue: FirestoreFieldValue,
  GeoPoint: FirestoreGeoPoint,
  Timestamp: FirestoreTimestamp,

  CACHE_SIZE_UNLIMITED: -1,

  setLogLevel(logLevel) {
    if (logLevel !== 'debug' && logLevel !== 'error' && logLevel !== 'silent') {
      throw new Error(
        "firebase.firestore.setLogLevel(*) 'logLevel' expected one of 'debug', 'error' or 'silent'",
      );
    }

    const native = NativeModules.RNFBFirestoreModule;
    native.setLogLevel(logLevel);
  },
};
