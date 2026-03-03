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

// To avoid React Native require cycle warnings
let FirestoreCollectionReference = null;
export function provideCollectionReferenceClass(collectionReference) {
  FirestoreCollectionReference = collectionReference;
}

let FirestoreDocumentSnapshot = null;
export function provideDocumentSnapshotClass(documentSnapshot) {
  FirestoreDocumentSnapshot = documentSnapshot;
}

let _id = 0;

export default class FirestoreDocumentReference {
  constructor(firestore, documentPath, converter) {
    this._firestore = firestore;
    this._documentPath = documentPath;
    this._converter = converter;
  }

  get firestore() {
    return this._firestore;
  }

  get converter() {
    return this._converter;
  }

  get id() {
    return this._documentPath.id;
  }

  get parent() {
    const parentPath = this._documentPath.parent();
    return new FirestoreCollectionReference(this._firestore, parentPath, this._converter);
  }

  get path() {
    return this._documentPath.relativeName;
  }

  collection(collectionPath) {
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

    return new FirestoreCollectionReference(this._firestore, path);
  }

  delete() {
    return this._firestore.native.documentDelete(this.path);
  }

  get(options) {
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
      .then(data =>
        createDeprecationProxy(
          new FirestoreDocumentSnapshot(this._firestore, data, this._converter),
        ),
      );
  }

  isEqual(other) {
    if (!(other instanceof FirestoreDocumentReference)) {
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

  onSnapshot(...args) {
    let snapshotListenOptions;
    let callback;
    let onNext;
    let onError;

    try {
      const options = parseSnapshotArgs(args);
      snapshotListenOptions = options.snapshotListenOptions;
      callback = options.callback;
      onNext = options.onNext;
      onError = options.onError;
    } catch (e) {
      throw new Error(`firebase.firestore().doc().onSnapshot(*) ${e.message}`);
    }

    function handleSuccess(documentSnapshot) {
      callback(documentSnapshot, null);
      onNext(documentSnapshot);
    }

    function handleError(error) {
      callback(null, error);
      onError(error);
    }

    const listenerId = _id++;

    const onSnapshotSubscription = this._firestore.emitter.addListener(
      this._firestore.eventNameForApp(`firestore_document_sync_event:${listenerId}`),
      event => {
        if (event.body.error) {
          handleError(NativeError.fromEvent(event.body.error, 'firestore'));
        } else {
          const documentSnapshot = createDeprecationProxy(
            new FirestoreDocumentSnapshot(this._firestore, event.body.snapshot, this._converter),
          );
          handleSuccess(documentSnapshot);
        }
      },
    );

    const unsubscribe = () => {
      onSnapshotSubscription.remove();
      this._firestore.native.documentOffSnapshot(listenerId);
    };

    this._firestore.native.documentOnSnapshot(this.path, listenerId, snapshotListenOptions);

    return unsubscribe;
  }

  set(data, options) {
    let setOptions;
    try {
      setOptions = parseSetOptions(options);
    } catch (e) {
      throw new Error(`firebase.firestore().doc().set(_, *) ${e.message}.`);
    }

    let converted = data;
    try {
      converted = applyFirestoreDataConverter(data, this._converter, setOptions);
    } catch (e) {
      throw new Error(
        `firebase.firestore().doc().set(*) 'withConverter.toFirestore' threw an error: ${e.message}.`,
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

  update(...args) {
    const updatedArgs = filterModularArgument(args);
    if (updatedArgs.length === 0) {
      throw new Error(
        'firebase.firestore().doc().update(*) expected at least 1 argument but was called with 0 arguments.',
      );
    }

    let data;
    try {
      data = parseUpdateArgs(updatedArgs);
    } catch (e) {
      throw new Error(`firebase.firestore().doc().update(*) ${e.message}`);
    }

    return this._firestore.native.documentUpdate(
      this.path,
      buildNativeMap(data, this._firestore._settings.ignoreUndefinedProperties),
    );
  }

  withConverter(converter) {
    if (isUndefined(converter) || isNull(converter)) {
      return new FirestoreDocumentReference(this._firestore, this._documentPath, null);
    }

    try {
      validateWithConverter(converter);
    } catch (e) {
      throw new Error(`firebase.firestore().doc().withConverter() ${e.message}`);
    }

    return new FirestoreDocumentReference(this._firestore, this._documentPath, converter);
  }
}

provideDocumentReferenceClass(FirestoreDocumentReference); // serialize
