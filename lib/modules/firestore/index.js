/**
 * @flow
 * Firestore representation wrapper
 */
import { NativeModules } from 'react-native';

import ModuleBase from './../../utils/ModuleBase';
import CollectionReference from './CollectionReference';
import DocumentReference from './DocumentReference';
import FieldValue from './FieldValue';
import GeoPoint from './GeoPoint';
import Path from './Path';
import WriteBatch from './WriteBatch';
import INTERNALS from '../../utils/internals';

import type DocumentSnapshot from './DocumentSnapshot';
import type FirebaseApp from '../core/firebase-app';
import type QuerySnapshot from './QuerySnapshot';

type CollectionSyncEvent = {
  appName: string,
  querySnapshot?: QuerySnapshot,
  error?: Object,
  listenerId: string,
  path: string,
}

type DocumentSyncEvent = {
  appName: string,
  documentSnapshot?: DocumentSnapshot,
  error?: Object,
  listenerId: string,
  path: string,
}

class FirestoreInternalModule extends ModuleBase {
  static _NAMESPACE = 'firestore';
  static _NATIVE_MODULE = 'RNFirebaseFirestore';

  _referencePath: Path;

  constructor(firebaseApp: FirebaseApp, options: Object = {}) {
    super(firebaseApp, options, true);
    this._referencePath = new Path([]);

    super.addListener(
      // sub to internal native event - this fans out to
      // public event name: onCollectionSnapshot
      super._getAppEventName('firestore_collection_sync_event'),
      this._onCollectionSyncEvent.bind(this),
    );

    super.addListener(
      // sub to internal native event - this fans out to
      // public event name: onDocumentSnapshot
      super._getAppEventName('firestore_document_sync_event'),
      this._onDocumentSyncEvent.bind(this),
    );
  }

  /**
   * Internal collection sync listener
   * @param event
   * @private
   */
  _onCollectionSyncEvent(event: CollectionSyncEvent) {
    if (event.error) {
      this.emit(super._getAppEventName(`onQuerySnapshotError:${event.listenerId}`), event.error);
    } else {
      this.emit(super._getAppEventName(`onQuerySnapshot:${event.listenerId}`), event.querySnapshot);
    }
  }

  /**
   * Internal document sync listener
   * @param event
   * @private
   */
  _onDocumentSyncEvent(event: DocumentSyncEvent) {
    if (event.error) {
      this.emit(super._getAppEventName(`onDocumentSnapshotError:${event.listenerId}`), event.error);
    } else {
      this.emit(super._getAppEventName(`onDocumentSnapshot:${event.listenerId}`), event.documentSnapshot);
    }
  }
}

/**
 * @class Firestore
 */
export default class Firestore extends FirestoreInternalModule {
  constructor(firebaseApp: FirebaseApp, options: Object = {}) {
    super(firebaseApp, options);
  }

  batch(): WriteBatch {
    return new WriteBatch(this);
  }

  /**
   *
   * @param collectionPath
   * @returns {CollectionReference}
   */
  collection(collectionPath: string): CollectionReference {
    const path = this._referencePath.child(collectionPath);
    if (!path.isCollection) {
      throw new Error('Argument "collectionPath" must point to a collection.');
    }

    return new CollectionReference(this, path);
  }

  /**
   *
   * @param documentPath
   * @returns {DocumentReference}
   */
  doc(documentPath: string): DocumentReference {
    const path = this._referencePath.child(documentPath);
    if (!path.isDocument) {
      throw new Error('Argument "documentPath" must point to a document.');
    }

    return new DocumentReference(this, path);
  }

  enablePersistence(): Promise<void> {
    throw new Error('Persistence is enabled by default on the Firestore SDKs');
  }

  runTransaction(): Promise<any> {
    throw new Error('firebase.firestore().runTransaction() coming soon');
  }

  setLogLevel(): void {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(Firestore, 'setLogLevel'));
  }

  settings(): void {
    throw new Error('firebase.firestore().settings() coming soon');
  }
}

export const statics = {
  FieldValue,
  GeoPoint,
  enableLogging(bool) {
    if (NativeModules[Firestore._NATIVE_MODULE]) {
      NativeModules[Firestore._NATIVE_MODULE].enableLogging(bool);
    }
  },
};
