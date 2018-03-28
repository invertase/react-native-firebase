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
import TransactionHandler from './TransactionHandler';
import Transaction from './Transaction';
import INTERNALS from '../../utils/internals';
import { getNativeModule } from '../../utils/native';

import type DocumentSnapshot from './DocumentSnapshot';
import type App from '../core/app';
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
  'firestore_transaction_event',
  'firestore_document_sync_event',
  'firestore_collection_sync_event',
];

export const MODULE_NAME = 'RNFirebaseFirestore';
export const NAMESPACE = 'firestore';

/**
 * @class Firestore
 */
export default class Firestore extends ModuleBase {
  _referencePath: Path;
  _transactionHandler: TransactionHandler;

  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      multiApp: true,
      hasShards: false,
      namespace: NAMESPACE,
    });

    this._referencePath = new Path([]);
    this._transactionHandler = new TransactionHandler(this);

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

  /**
   * -------------
   *  PUBLIC API
   * -------------
   */

  /**
   * Creates a write batch, used for performing multiple writes as a single atomic operation.
   *
   * @returns {WriteBatch}
   */
  batch(): WriteBatch {
    return new WriteBatch(this);
  }

  /**
   * Gets a CollectionReference instance that refers to the collection at the specified path.
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

  disableNetwork(): void {
    return getNativeModule(this).disableNetwork();
  }

  /**
   * Gets a DocumentReference instance that refers to the document at the specified path.
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

  enableNetwork(): Promise<void> {
    return getNativeModule(this).enableNetwork();
  }

  /**
   * Executes the given updateFunction and then attempts to commit the
   * changes applied within the transaction. If any document read within
   * the transaction has changed, Cloud Firestore retries the updateFunction.
   *
   * If it fails to commit after 5 attempts, the transaction fails.
   *
   * @param updateFunction
   * @returns {void|Promise<any>}
   */
  runTransaction(
    updateFunction: (transaction: Transaction) => Promise<any>
  ): Promise<any> {
    return this._transactionHandler._add(updateFunction);
  }

  /**
   * -------------
   *  UNSUPPORTED
   * -------------
   */

  setLogLevel(): void {
    throw new Error(
      INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(
        'firestore',
        'setLogLevel'
      )
    );
  }

  /**
   * -------------
   *     MISC
   * -------------
   */

  enablePersistence(): Promise<void> {
    throw new Error('Persistence is enabled by default on the Firestore SDKs');
  }

  settings(): void {
    throw new Error('firebase.firestore().settings() coming soon');
  }

  /**
   * -------------
   *   INTERNALS
   * -------------
   */

  /**
   * Internal collection sync listener
   *
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
   *
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
