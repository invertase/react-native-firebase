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

import { isString } from '@react-native-firebase/app/lib/common';

const RESERVED = new RegExp('[~*/\\[\\]]');

export default class FirestoreFieldPath {
  static documentId() {
    return DOCUMENT_ID;
  }

  constructor(...segments) {
    if (segments.length === 0) {
      throw new Error('firebase.firestore.FieldPath cannot construct FieldPath with no segments.');
    }

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!isString(segment) || segment === '') {
        throw new Error(
          `firebase.firestore.FieldPath invalid segment at index ${i}, expected a non-empty string.`,
        );
      }
    }

    this._segments = segments;
  }

  isEqual(other) {
    if (!(other instanceof FirestoreFieldPath)) {
      throw new Error(
        "firebase.firestore.FieldPath.isEqual(*) 'other' expected instance of FieldPath.",
      );
    }

    return this._toPath() === other._toPath();
  }

  _toPath() {
    return this._segments.join('.');
  }

  _toArray() {
    return this._segments;
  }
}

export const DOCUMENT_ID = new FirestoreFieldPath('__name__');

export function fromDotSeparatedString(path) {
  if (path === '' || path.startsWith('.') || path.endsWith('.') || path.indexOf('..') > 0) {
    throw new Error(
      "Invalid field path. Paths must not be empty, begin with '.', end with '.', or contain '..'.",
    );
  }

  const found = path.search(RESERVED);

  if (found > 0) {
    throw new Error(
      `Invalid field path (${path}). Paths must not contain '~', '*', '/', '[', or ']'.`,
    );
  }

  return new FirestoreFieldPath(...path.split('.'));
}
