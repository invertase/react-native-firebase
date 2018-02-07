/**
 * @flow
 * Firestore representation wrapper
 */
import { NativeModules } from 'react-native';

import { getAppEventName, SharedEventEmitter } from '../../utils/events';
import ModuleBase from '../../utils/ModuleBase';
import CollectionReference from './CollectionReference';
import DocumentReference from './DocumentReference';
import FieldPath from './FieldPath';
import FieldValue from './FieldValue';
import GeoPoint from './GeoPoint';
import Path from './Path';
import WriteBatch from './WriteBatch';
import INTERNALS from '../../utils/internals';

import type DocumentSnapshot from './DocumentSnapshot';
import type App from '../core/firebase-app';
import type QuerySnapshot from './QuerySnapshot';

type CollectionSyncEvent = {
  appName: string,
  querySnapshot?: QuerySnapshot,
  error?: Object,
  listenerId: string,
  path: string,
};

type DocumentSyncEvent = {
  appName: string,
  documentSnapshot?: DocumentSnapshot,
  error?: Object,
  listenerId: string,
  path: string,
};

const NATIVE_EVENTS = [
  'firestore_collection_sync_event',
  'firestore_document_sync_event',
];

export const MODULE_NAME = 'RNFirebaseFirestore';
export const NAMESPACE = 'firestore';

/**
 * @class Firestore
 */
export default class Firestore extends ModuleBase {
  _referencePath: Path;

  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      multiApp: true,
      namespace: NAMESPACE,
    });
    this._referencePath = new Path([]);

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onCollectionSnapshot
      getAppEventName(this, 'firestore_collection_sync_event'),
      this._onCollectionSyncEvent.bind(this)
    );

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onDocumentSnapshot
      getAppEventName(this, 'firestore_document_sync_event'),
      this._onDocumentSyncEvent.bind(this)
    );
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
    throw new Error(
      INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(
        'firestore',
        'setLogLevel'
      )
    );
  }

  settings(): void {
    throw new Error('firebase.firestore().settings() coming soon');
  }

  /**
   * Internal collection sync listener
   * @param event
   * @private
   */
  _onCollectionSyncEvent(event: CollectionSyncEvent) {
    if (event.error) {
      SharedEventEmitter.emit(
        getAppEventName(this, `onQuerySnapshotError:${event.listenerId}`),
        event.error
      );
    } else {
      SharedEventEmitter.emit(
        getAppEventName(this, `onQuerySnapshot:${event.listenerId}`),
        event.querySnapshot
      );
    }
  }

  /**
   * Internal document sync listener
   * @param event
   * @private
   */
  _onDocumentSyncEvent(event: DocumentSyncEvent) {
    if (event.error) {
      SharedEventEmitter.emit(
        getAppEventName(this, `onDocumentSnapshotError:${event.listenerId}`),
        event.error
      );
    } else {
      SharedEventEmitter.emit(
        getAppEventName(this, `onDocumentSnapshot:${event.listenerId}`),
        event.documentSnapshot
      );
    }
  }
}

export const statics = {
  FieldPath,
  FieldValue,
  GeoPoint,
  enableLogging(enabled: boolean) {
    if (NativeModules[MODULE_NAME]) {
      NativeModules[MODULE_NAME].enableLogging(enabled);
    }
  },
};
