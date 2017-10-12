/**
 * @flow
 * Firestore representation wrapper
 */
import ModuleBase from './../../utils/ModuleBase';
import CollectionReference from './CollectionReference';
import DocumentReference from './DocumentReference';
import DocumentSnapshot from './DocumentSnapshot';
import FieldValue from './FieldValue';
import GeoPoint from './GeoPoint';
import Path from './Path';
import WriteBatch from './WriteBatch';
import INTERNALS from './../../internals';

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

/**
 * @class Firestore
 */
export default class Firestore extends ModuleBase {
  static _NAMESPACE = 'firestore';
  static _NATIVE_MODULE = 'RNFirebaseFirestore';

  _referencePath: Path;

  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, true);
    this._referencePath = new Path([]);

    this.addListener(
      // sub to internal native event - this fans out to
      // public event name: onCollectionSnapshot
      this._getAppEventName('firestore_collection_sync_event'),
      this._onCollectionSyncEvent.bind(this),
    );

    this.addListener(
      // sub to internal native event - this fans out to
      // public event name: onDocumentSnapshot
      this._getAppEventName('firestore_document_sync_event'),
      this._onDocumentSyncEvent.bind(this),
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

  runTransaction(updateFunction): Promise<any> {
    throw new Error('firebase.firestore().runTransaction() coming soon');
  }

  setLogLevel(logLevel: 'debug' | 'error' | 'silent'): void {
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_MODULE_METHOD(Firestore, 'setLogLevel'));
  }

  settings(settings: Object): void {
    throw new Error('firebase.firestore().settings() coming soon');
  }

  /**
   * INTERNALS
   */

  /**
   * Internal collection sync listener
   * @param event
   * @private
   */
  _onCollectionSyncEvent(event: CollectionSyncEvent) {
    if (event.error) {
      this.emit(this._getAppEventName(`onQuerySnapshotError:${event.listenerId}`), event.error);
    } else {
      this.emit(this._getAppEventName(`onQuerySnapshot:${event.listenerId}`), event.querySnapshot);
    }
  }

  /**
   * Internal document sync listener
   * @param event
   * @private
   */
  _onDocumentSyncEvent(event: DocumentSyncEvent) {
    if (event.error) {
      this.emit(this._getAppEventName(`onDocumentSnapshotError:${event.listenerId}`), event.error);
    } else {
      this.emit(this._getAppEventName(`onDocumentSnapshot:${event.listenerId}`), event.documentSnapshot);
    }
  }
}

export const statics = {
  FieldValue,
  GeoPoint,
};
