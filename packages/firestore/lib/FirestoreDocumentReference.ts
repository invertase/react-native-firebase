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
  isObject,
  isString,
  isUndefined,
  isNull,
  createDeprecationProxy,
  filterModularArgument,
} from '@react-native-firebase/app/dist/module/common';
import NativeError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import {
  parseSetOptions,
  parseSnapshotArgs,
  parseUpdateArgs,
  validateWithConverter,
  applyFirestoreDataConverter,
} from './utils';
import { buildNativeMap, provideDocumentReferenceClass } from './utils/serialize';

import type FirestoreCollectionReferenceClass from './FirestoreCollectionReference';
import type DocumentSnapshot from './FirestoreDocumentSnapshot';
import type { FirestoreInternal, FirestoreSyncEventBodyInternal } from './types/internal';
import type { DocumentSnapshotNativeData } from './FirestoreDocumentSnapshot';
import type FirestorePath from './FirestorePath';
import type { DocumentData, FirestoreDataConverter, ListenSource } from './types/firestore';

let FirestoreCollectionReference:
  | (new (
      firestore: FirestoreInternal,
      path: FirestorePath,
      converter?: FirestoreDataConverter<DocumentData, DocumentData> | null,
    ) => FirestoreCollectionReferenceClass)
  | null = null;

export function provideCollectionReferenceClass(
  collectionReference: new (
    firestore: FirestoreInternal,
    path: FirestorePath,
    converter?: FirestoreDataConverter<DocumentData, DocumentData> | null,
  ) => FirestoreCollectionReferenceClass,
): void {
  FirestoreCollectionReference = collectionReference;
}

let FirestoreDocumentSnapshotClass:
  | (new (
      firestore: FirestoreInternal,
      data: DocumentSnapshotNativeData,
      converter: FirestoreDataConverter<DocumentData, DocumentData> | null,
    ) => DocumentSnapshot)
  | null = null;

export function provideDocumentSnapshotClass(
  documentSnapshot: new (
    firestore: FirestoreInternal,
    data: DocumentSnapshotNativeData,
    converter: FirestoreDataConverter<DocumentData, DocumentData> | null,
  ) => DocumentSnapshot,
): void {
  FirestoreDocumentSnapshotClass = documentSnapshot;
}

let _id = 0;

export default class DocumentReference<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  readonly type = 'document' as const;
  _firestore: FirestoreInternal;
  _documentPath: FirestorePath;
  _converter: FirestoreDataConverter<AppModelType, DbModelType> | null;

  constructor(firestore: FirestoreInternal, documentPath: FirestorePath, converter?: unknown) {
    this._firestore = firestore;
    this._documentPath = documentPath;
    this._converter = (converter === undefined ? null : converter) as FirestoreDataConverter<
      AppModelType,
      DbModelType
    > | null;
  }

  get firestore(): FirestoreInternal {
    return this._firestore;
  }

  get converter(): FirestoreDataConverter<AppModelType, DbModelType> | null {
    return this._converter;
  }

  get id(): string {
    return this._documentPath.id;
  }

  get parent(): FirestoreCollectionReferenceClass {
    const parentPath = this._documentPath.parent();
    return new FirestoreCollectionReference!(
      this._firestore,
      parentPath!,
      this._converter as unknown as FirestoreDataConverter<DocumentData, DocumentData> | null,
    );
  }

  get path(): string {
    return this._documentPath.relativeName;
  }

  collection(collectionPath: string): FirestoreCollectionReferenceClass {
    if (!isString(collectionPath)) {
      throw new Error(
        "firebase.firestore().doc().collection(*) 'collectionPath' must be a string value.",
      );
    }

    if (collectionPath === '') {
      throw new Error(
        "firebase.firestore().doc().collection(*) 'collectionPath' must be a non-empty string.",
      );
    }

    const path = this._documentPath.child(collectionPath);

    if (!path.isCollection) {
      throw new Error(
        "firebase.firestore().doc().collection(*) 'collectionPath' must point to a collection.",
      );
    }

    return new FirestoreCollectionReference!(this._firestore, path);
  }

  delete(): Promise<void> {
    return this._firestore.native.documentDelete(this.path);
  }

  get(options?: {
    source?: 'default' | 'server' | 'cache';
  }): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
    if (!isUndefined(options) && !isObject(options)) {
      throw new Error("firebase.firestore().doc().get(*) 'options' must be an object is provided.");
    }

    if (
      options &&
      options.source &&
      options.source !== 'default' &&
      options.source !== 'server' &&
      options.source !== 'cache'
    ) {
      throw new Error(
        "firebase.firestore().doc().get(*) 'options' GetOptions.source must be one of 'default', 'server' or 'cache'.",
      );
    }

    return this._firestore.native
      .documentGet(this.path, options)
      .then(
        (data: unknown) =>
          createDeprecationProxy(
            new FirestoreDocumentSnapshotClass!(
              this._firestore,
              data as DocumentSnapshotNativeData,
              this._converter as unknown as FirestoreDataConverter<
                DocumentData,
                DocumentData
              > | null,
            ),
          ) as DocumentSnapshot<AppModelType, DbModelType>,
      );
  }

  isEqual(other: DocumentReference<AppModelType, DbModelType>): boolean {
    if (!(other instanceof DocumentReference)) {
      throw new Error(
        "firebase.firestore().doc().isEqual(*) 'other' expected a DocumentReference instance.",
      );
    }

    return !(
      this.path !== other.path ||
      this.firestore.app.name !== other.firestore.app.name ||
      this.firestore.app.options.projectId !== other.firestore.app.options.projectId ||
      this.converter !== other.converter
    );
  }

  onSnapshot(...args: unknown[]): () => void {
    let snapshotListenOptions: { includeMetadataChanges?: boolean; source?: ListenSource };
    let callback: (
      snapshot: DocumentSnapshot<AppModelType, DbModelType> | null,
      error: Error | null,
    ) => void;
    let onNext: (snapshot: DocumentSnapshot<AppModelType, DbModelType>) => void;
    let onError: (error: Error) => void;

    try {
      const options = parseSnapshotArgs(args);
      snapshotListenOptions = options.snapshotListenOptions;
      callback = options.callback;
      onNext = options.onNext;
      onError = options.onError;
    } catch (e) {
      throw new Error(`firebase.firestore().doc().onSnapshot(*) ${(e as Error).message}`);
    }

    function handleSuccess(documentSnapshot: DocumentSnapshot<AppModelType, DbModelType>): void {
      callback(documentSnapshot, null);
      onNext(documentSnapshot);
    }

    function handleError(error: Error): void {
      callback(null, error);
      onError(error);
    }

    const listenerId = _id++;

    const onSnapshotSubscription = this._firestore.emitter.addListener(
      this._firestore.eventNameForApp(`firestore_document_sync_event:${listenerId}`),
      (event: { body: FirestoreSyncEventBodyInternal }) => {
        if (event.body.error) {
          handleError(NativeError.fromEvent(event.body.error, 'firestore'));
        } else {
          const snapshot = event.body.snapshot;
          if (!snapshot) return;
          const documentSnapshot = createDeprecationProxy(
            new FirestoreDocumentSnapshotClass!(
              this._firestore,
              snapshot,
              this._converter as unknown as FirestoreDataConverter<
                DocumentData,
                DocumentData
              > | null,
            ),
          ) as DocumentSnapshot<AppModelType, DbModelType>;
          handleSuccess(documentSnapshot);
        }
      },
    );

    const unsubscribe = (): void => {
      onSnapshotSubscription.remove();
      this._firestore.native.documentOffSnapshot(listenerId);
    };

    this._firestore.native.documentOnSnapshot(this.path, listenerId, snapshotListenOptions);

    return unsubscribe;
  }

  set(data: unknown, options?: unknown): Promise<void> {
    let setOptions: ReturnType<typeof parseSetOptions>;
    try {
      setOptions = parseSetOptions(options);
    } catch (e) {
      throw new Error(`firebase.firestore().doc().set(_, *) ${(e as Error).message}.`);
    }

    let converted = data;
    try {
      converted = applyFirestoreDataConverter(data, this._converter, setOptions);
    } catch (e) {
      throw new Error(
        `firebase.firestore().doc().set(*) 'withConverter.toFirestore' threw an error: ${(e as Error).message}.`,
      );
    }

    if (!isObject(converted)) {
      throw new Error("firebase.firestore().doc().set(*) 'data' must be an object.");
    }

    return this._firestore.native.documentSet(
      this.path,
      buildNativeMap(converted, this._firestore._settings.ignoreUndefinedProperties),
      setOptions,
    );
  }

  update(...args: unknown[]): Promise<void> {
    const updatedArgs = filterModularArgument(args);
    if (updatedArgs.length === 0) {
      throw new Error(
        'firebase.firestore().doc().update(*) expected at least 1 argument but was called with 0 arguments.',
      );
    }

    let data: Record<string, unknown>;
    try {
      data = parseUpdateArgs(updatedArgs);
    } catch (e) {
      throw new Error(`firebase.firestore().doc().update(*) ${(e as Error).message}`);
    }

    return this._firestore.native.documentUpdate(
      this.path,
      buildNativeMap(data, this._firestore._settings.ignoreUndefinedProperties),
    );
  }

  withConverter(converter: null): DocumentReference<DocumentData, DocumentData>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): DocumentReference<NewAppModelType, NewDbModelType>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType> | null,
  ):
    | DocumentReference<DocumentData, DocumentData>
    | DocumentReference<NewAppModelType, NewDbModelType> {
    if (isUndefined(converter) || isNull(converter)) {
      return new DocumentReference<DocumentData, DocumentData>(
        this._firestore,
        this._documentPath,
        null,
      );
    }

    try {
      validateWithConverter(converter);
    } catch (e) {
      throw new Error(`firebase.firestore().doc().withConverter() ${(e as Error).message}`);
    }

    return new DocumentReference<NewAppModelType, NewDbModelType>(
      this._firestore,
      this._documentPath,
      converter,
    );
  }
}

provideDocumentReferenceClass(DocumentReference);
