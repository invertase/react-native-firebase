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

import { isArray, isNumber } from '@react-native-firebase/app/lib/common';

export default class FirestoreVectorValue {
  constructor(values) {
    if (values === undefined) {
      this._values = [];
      return;
    }

    if (!isArray(values)) {
      throw new Error(
        "firebase.firestore.VectorValue(values?) 'values' expected an array of numbers or undefined.",
      );
    }

    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (!isNumber(v)) {
        throw new Error(
          `firebase.firestore.VectorValue(values?) 'values[${i}]' expected a number value.`,
        );
      }
    }

    // Store a shallow copy to ensure immutability semantics for the input array
    this._values = values.slice();
  }

  static fromJSON(json) {
    parsedVector = JSON.parse(json);
    return new FirestoreVectorValue(parsedVector.vectorValues);
  }

  isEqual(other) {
    if (!(other instanceof FirestoreVectorValue)) {
      throw new Error(
        "firebase.firestore.VectorValue.isEqual(*) 'other' expected a VectorValue instance.",
      );
    }

    const a = this._values;
    const b = other._values;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      // Use strict equality; Firestore numbers allow NaN/Infinity – equality semantics match JS
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  toArray() {
    return this._values.slice();
  }

  toJSON() {
    return { vectorValues: this._values.slice() };
  }
}
