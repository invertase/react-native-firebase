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

import { getStaticFirestoreMainModule } from './internal/staticNativeModule';
import { Blob } from './FirestoreBlob';
import { FieldPath } from './FieldPath';
import { FieldValue } from './FieldValue';
import { Filter } from './FirestoreFilter';
import { GeoPoint } from './FirestoreGeoPoint';
import { Timestamp } from './FirestoreTimestamp';
import { VectorValue } from './FirestoreVectorValue';
import type { LogLevel } from './types/firestore';

type FirestoreLogLevel = LogLevel;

const FirestoreStatics = {
  Blob: Blob,
  FieldPath: FieldPath,
  FieldValue: FieldValue,
  GeoPoint: GeoPoint,
  Timestamp: Timestamp,
  Filter: Filter,
  VectorValue: VectorValue,
  vector(values?: number[]): VectorValue {
    return new VectorValue(values);
  },

  CACHE_SIZE_UNLIMITED: -1,

  setLogLevel(logLevel: FirestoreLogLevel): void {
    if (logLevel !== 'debug' && logLevel !== 'error' && logLevel !== 'silent') {
      throw new Error(
        "firebase.firestore.setLogLevel(*) 'logLevel' expected one of 'debug', 'error' or 'silent'",
      );
    }

    // NewArch-AD-18 E8: static setLogLevel — no FirebaseModule instance; turbo main host.
    getStaticFirestoreMainModule().setLogLevel(logLevel);
  },
};

export default FirestoreStatics;
