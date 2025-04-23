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

import { isArray, isString } from '@react-native-firebase/app/lib/common';
import FirestoreDocumentReference, {
  provideDocumentSnapshotClass,
} from './FirestoreDocumentReference';
import FirestoreFieldPath, { fromDotSeparatedString } from './FirestoreFieldPath';
import FirestorePath from './FirestorePath';
import FirestoreSnapshotMetadata from './FirestoreSnapshotMetadata';
import { extractFieldPathData } from './utils';
import { parseNativeMap } from './utils/serialize';

export default class FirestoreDocumentSnapshot {
  constructor(firestore, nativeData) {
    this._data = parseNativeMap(firestore, nativeData.data);
    this._metadata = new FirestoreSnapshotMetadata(nativeData.metadata);
    this._ref = new FirestoreDocumentReference(firestore, FirestorePath.fromName(nativeData.path));
    this._exists = nativeData.exists;
  }

  get id() {
    return this._ref.id;
  }

  get metadata() {
    return this._metadata;
  }

  get ref() {
    return this._ref;
  }

  exists() {
    return this._exists;
  }

  data() {
    // TODO: ehesp: Figure out how to handle this.
    // const snapshotOptions = {};
    //
    // if (!isUndefined(options)) {
    //   if (!isObject(options)) {
    //     throw new Error(
    //       `firebase.firestore() DocumentSnapshot.data(*) 'options' expected an object if defined.`,
    //     );
    //   }
    //
    //   if (
    //     options.serverTimestamps &&
    //     options.serverTimestamps !== 'estimate' &&
    //     options.serverTimestamps !== 'previous' &&
    //     options.serverTimestamps !== 'none'
    //   ) {
    //     throw new Error(
    //       `firebase.firestore() DocumentSnapshot.data(*) 'options.serverTimestamps' expected one of 'estimate', 'previous' or 'none'.`,
    //     );
    //   }
    // }

    return this._data;
  }

  get(fieldPath) {
    // TODO: ehesp: How are SnapshotOptions handled?

    if (
      !isString(fieldPath) &&
      !(fieldPath instanceof FirestoreFieldPath) &&
      !Array.isArray(fieldPath)
    ) {
      throw new Error(
        "firebase.firestore() DocumentSnapshot.get(*) 'fieldPath' expected type string, array or FieldPath.",
      );
    }

    let path;

    if (isString(fieldPath)) {
      try {
        path = fromDotSeparatedString(fieldPath);
      } catch (e) {
        throw new Error(`firebase.firestore() DocumentSnapshot.get(*) 'fieldPath' ${e.message}.`);
      }
    } else if (isArray(fieldPath)) {
      path = new FirestoreFieldPath(...fieldPath);
    } else {
      // Is already field path
      path = fieldPath;
    }

    return extractFieldPathData(this._data, path._segments);
  }

  isEqual(other) {
    if (!(other instanceof FirestoreDocumentSnapshot)) {
      throw new Error(
        "firebase.firestore() DocumentSnapshot.isEqual(*) 'other' expected a DocumentSnapshot instance.",
      );
    }

    if (
      this.exists() !== other.exists() ||
      !this.metadata.isEqual(other.metadata) ||
      !this.ref.isEqual(other.ref)
    ) {
      return false;
    }

    const thisData = JSON.stringify(this.data());
    const otherData = JSON.stringify(other.data());

    return thisData === otherData;
  }
}

// To avoid React Native require cycle
provideDocumentSnapshotClass(FirestoreDocumentSnapshot);
