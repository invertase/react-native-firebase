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

import { isArray, isString } from '@react-native-firebase/app/dist/module/common';
import FirestoreDocumentReference, {
  provideDocumentSnapshotClass,
} from './FirestoreDocumentReference';
import FirestoreFieldPath, { fromDotSeparatedString } from './FirestoreFieldPath';
import FirestorePath from './FirestorePath';
import FirestoreSnapshotMetadata from './FirestoreSnapshotMetadata';
import { extractFieldPathData } from './utils';
import { parseNativeMap } from './utils/serialize';

export interface DocumentSnapshotNativeData {
  path: string;
  data?: unknown;
  metadata?: [boolean, boolean];
  exists?: boolean;
}

export default class FirestoreDocumentSnapshot {
  _firestore: unknown;
  _nativeData: DocumentSnapshotNativeData;
  _data: Record<string, unknown> | undefined;
  _metadata: FirestoreSnapshotMetadata;
  _ref: FirestoreDocumentReference;
  _exists: boolean;
  _converter: unknown;

  constructor(firestore: unknown, nativeData: DocumentSnapshotNativeData, converter: unknown) {
    this._firestore = firestore;
    this._nativeData = nativeData;
    this._data = parseNativeMap(firestore as any, nativeData.data);
    this._metadata = new FirestoreSnapshotMetadata(nativeData.metadata ?? [false, false]);
    this._ref = new FirestoreDocumentReference(
      firestore as any,
      FirestorePath.fromName(nativeData.path),
    );
    this._exists = nativeData.exists ?? false;
    this._converter = converter;
  }

  get id(): string {
    return this._ref.id;
  }

  get metadata(): FirestoreSnapshotMetadata {
    return this._metadata;
  }

  get ref(): FirestoreDocumentReference {
    return this._ref;
  }

  exists(): boolean {
    return this._exists;
  }

  data(): unknown {
    if (
      this._converter &&
      (this._converter as { fromFirestore?: (snapshot: FirestoreDocumentSnapshot) => unknown })
        .fromFirestore
    ) {
      try {
        return (
          this._converter as { fromFirestore: (snapshot: FirestoreDocumentSnapshot) => unknown }
        ).fromFirestore(new FirestoreDocumentSnapshot(this._firestore, this._nativeData, null));
      } catch (e) {
        throw new Error(
          `firebase.firestore() DocumentSnapshot.data(*) 'withConverter.fromFirestore' threw an error: ${(e as Error).message}.`,
        );
      }
    }
    return this._data;
  }

  get(fieldPath: string | FirestoreFieldPath | string[]): unknown {
    if (
      !isString(fieldPath) &&
      !(fieldPath instanceof FirestoreFieldPath) &&
      !Array.isArray(fieldPath)
    ) {
      throw new Error(
        "firebase.firestore() DocumentSnapshot.get(*) 'fieldPath' expected type string, array or FieldPath.",
      );
    }

    let path: FirestoreFieldPath;

    if (isString(fieldPath)) {
      try {
        path = fromDotSeparatedString(fieldPath);
      } catch (e) {
        throw new Error(
          `firebase.firestore() DocumentSnapshot.get(*) 'fieldPath' ${(e as Error).message}.`,
        );
      }
    } else if (isArray(fieldPath)) {
      path = new FirestoreFieldPath(...fieldPath);
    } else {
      path = fieldPath;
    }

    return extractFieldPathData(this._data, path._segments);
  }

  isEqual(other: FirestoreDocumentSnapshot): boolean {
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

provideDocumentSnapshotClass(FirestoreDocumentSnapshot);
