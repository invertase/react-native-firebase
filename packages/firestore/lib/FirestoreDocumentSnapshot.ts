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

import { isString } from '@react-native-firebase/app/dist/module/common';
import DocumentReference, { provideDocumentSnapshotClass } from './FirestoreDocumentReference';
import FieldPath, { fromDotSeparatedString } from './FieldPath';
import FirestorePath from './FirestorePath';
import SnapshotMetadata from './FirestoreSnapshotMetadata';
import type { SnapshotOptions } from './types/firestore';
import { extractFieldPathData } from './utils';
import { parseNativeMap } from './utils/serialize';
import type { FirestoreInternal } from './types/internal';

export interface DocumentSnapshotNativeData {
  path: string;
  data?: unknown;
  metadata?: [boolean, boolean];
  exists?: boolean;
}

export default class DocumentSnapshot {
  _firestore: FirestoreInternal;
  _nativeData: DocumentSnapshotNativeData;
  _data: Record<string, unknown> | undefined;
  _metadata: SnapshotMetadata;
  _ref: DocumentReference;
  _exists: boolean;
  _converter: unknown;

  constructor(
    firestore: FirestoreInternal,
    nativeData: DocumentSnapshotNativeData,
    converter: unknown,
  ) {
    this._firestore = firestore;
    this._nativeData = nativeData;
    this._data = parseNativeMap(firestore, nativeData.data as Record<string, unknown> | undefined);
    this._metadata = new SnapshotMetadata(nativeData.metadata ?? [false, false]);
    this._ref = new DocumentReference(firestore, FirestorePath.fromName(nativeData.path));
    this._exists = nativeData.exists ?? false;
    this._converter = converter;
  }

  get id(): string {
    return this._ref.id;
  }

  get metadata(): SnapshotMetadata {
    return this._metadata;
  }

  get ref(): DocumentReference {
    return this._ref;
  }

  exists(): boolean {
    return this._exists;
  }

  data(options?: SnapshotOptions): unknown {
    if (
      this._converter &&
      (this._converter as { fromFirestore?: (snapshot: DocumentSnapshot) => unknown }).fromFirestore
    ) {
      try {
        return (
          this._converter as {
            fromFirestore: (snapshot: DocumentSnapshot, options?: SnapshotOptions) => unknown;
          }
        ).fromFirestore(new DocumentSnapshot(this._firestore, this._nativeData, null), options);
      } catch (e) {
        throw new Error(
          `firebase.firestore() DocumentSnapshot.data(*) 'withConverter.fromFirestore' threw an error: ${(e as Error).message}.`,
        );
      }
    }
    return this._data;
  }

  get(fieldPath: string | FieldPath, _options?: SnapshotOptions): unknown {
    if (!isString(fieldPath) && !(fieldPath instanceof FieldPath)) {
      throw new Error(
        "firebase.firestore() DocumentSnapshot.get(*) 'fieldPath' expected type string or FieldPath.",
      );
    }

    let path: FieldPath;

    if (isString(fieldPath)) {
      try {
        path = fromDotSeparatedString(fieldPath);
      } catch (e) {
        throw new Error(
          `firebase.firestore() DocumentSnapshot.get(*) 'fieldPath' ${(e as Error).message}.`,
        );
      }
    } else {
      path = fieldPath;
    }

    return extractFieldPathData(this._data, path._segments);
  }

  isEqual(other: DocumentSnapshot): boolean {
    if (!(other instanceof DocumentSnapshot)) {
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

provideDocumentSnapshotClass(DocumentSnapshot);
