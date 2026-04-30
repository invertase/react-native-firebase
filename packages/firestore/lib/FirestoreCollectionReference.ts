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

import {
  generateFirestoreId,
  isObject,
  isNull,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';
import DocumentReference, { provideCollectionReferenceClass } from './FirestoreDocumentReference';
import Query from './FirestoreQuery';
import QueryModifiers from './FirestoreQueryModifiers';
import { validateWithConverter } from './utils';

import type FirestorePath from './FirestorePath';
import type { DocumentData, FirestoreDataConverter } from './types/firestore';
import type { FirestoreInternal } from './types/internal';

export default class CollectionReference<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends Query<AppModelType, DbModelType> {
  readonly type = 'collection' as const;
  constructor(
    firestore: FirestoreInternal,
    collectionPath: FirestorePath,
    converter?: FirestoreDataConverter<AppModelType, DbModelType> | null,
  ) {
    super(firestore, collectionPath, new QueryModifiers(), undefined, converter);
  }

  get id(): string {
    return this._collectionPath.id;
  }

  get parent(): DocumentReference<DocumentData, DocumentData> | null {
    const parent = this._collectionPath.parent();
    if (!parent) {
      return null;
    }
    return new DocumentReference<DocumentData, DocumentData>(this._firestore, parent);
  }

  get path(): string {
    return this._collectionPath.relativeName;
  }

  add(data: AppModelType): Promise<DocumentReference<AppModelType, DbModelType>> {
    if (!isObject(data)) {
      throw new Error("firebase.firestore().collection().add(*) 'data' must be an object.");
    }

    const documentRef = this.doc();
    return documentRef.set(data).then(() => Promise.resolve(documentRef));
  }

  doc(documentPath?: string): DocumentReference<AppModelType, DbModelType> {
    const newPath = documentPath ?? generateFirestoreId();
    const path = this._collectionPath.child(newPath);

    if (!path.isDocument) {
      throw new Error(
        "firebase.firestore().collection().doc(*) 'documentPath' must point to a document.",
      );
    }

    return new DocumentReference<AppModelType, DbModelType>(this._firestore, path, this._converter);
  }

  withConverter(converter: null): CollectionReference<DocumentData, DocumentData>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): CollectionReference<NewAppModelType, NewDbModelType>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType> | null | unknown,
  ):
    | CollectionReference<DocumentData, DocumentData>
    | CollectionReference<NewAppModelType, NewDbModelType> {
    if (isUndefined(converter) || isNull(converter)) {
      return new CollectionReference<DocumentData, DocumentData>(
        this._firestore,
        this._collectionPath,
        null,
      );
    }

    try {
      validateWithConverter(converter);
    } catch (e) {
      throw new Error(`firebase.firestore().collection().withConverter() ${(e as Error).message}`);
    }

    return new CollectionReference<NewAppModelType, NewDbModelType>(
      this._firestore,
      this._collectionPath,
      converter as FirestoreDataConverter<NewAppModelType, NewDbModelType>,
    );
  }
}

provideCollectionReferenceClass(CollectionReference);
