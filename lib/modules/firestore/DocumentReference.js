/**
 * @flow
 * DocumentReference representation wrapper
 */
import CollectionReference from './CollectionReference';
import DocumentSnapshot from './DocumentSnapshot';
import Path from './Path';
import INTERNALS from './../../internals';
import { firestoreAutoId } from '../../utils';

export type DeleteOptions = {
  lastUpdateTime?: string,
}

export type WriteOptions = {
  merge?: boolean,
}

export type WriteResult = {
  writeTime: string,
}

 /**
 * @class DocumentReference
 */
export default class DocumentReference {
  _documentPath: Path;
  _firestore: Object;

  constructor(firestore: Object, documentPath: Path) {
    this._documentPath = documentPath;
    this._firestore = firestore;
  }

  get firestore(): Object {
    return this._firestore;
  }

  get id(): string | null {
    return this._documentPath.id;
  }

  get parent(): CollectionReference | null {
    const parentPath = this._documentPath.parent();
    return parentPath ? new CollectionReference(this._firestore, parentPath) : null;
  }

  get path(): string {
    return this._documentPath.relativeName;
  }

  collection(collectionPath: string): CollectionReference {
    const path = this._documentPath.child(collectionPath);
    if (!path.isCollection) {
      throw new Error('Argument "collectionPath" must point to a collection.');
    }

    return new CollectionReference(this._firestore, path);
  }

  create(data: { [string]: any }): Promise<WriteResult> {
    /* return this._firestore._native
      .documentCreate(this.path, data); */
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('DocumentReference', 'create'));
  }

  delete(deleteOptions?: DeleteOptions): Promise<WriteResult> {
    return this._firestore._native
      .documentDelete(this.path, deleteOptions);
  }

  get(): Promise<DocumentSnapshot> {
    return this._firestore._native
      .documentGet(this.path)
      .then(result => new DocumentSnapshot(this._firestore, result));
  }

  getCollections(): Promise<CollectionReference[]> {
    /* return this._firestore._native
      .documentCollections(this.path)
      .then((collectionIds) => {
        const collections = [];

        for (const collectionId of collectionIds) {
          collections.push(this.collection(collectionId));
        }

        return collections;
    }); */
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_METHOD('DocumentReference', 'getCollections'));
  }

  onSnapshot(onNext: Function, onError?: Function): () => void {
    // TODO: Validation
    const listenerId = firestoreAutoId();

    const listener = (nativeDocumentSnapshot) => {
      const documentSnapshot = new DocumentSnapshot(this, nativeDocumentSnapshot);
      onNext(documentSnapshot);
    };

    // Listen to snapshot events
    this._firestore.on(
      this._firestore._getAppEventName(`onDocumentSnapshot:${listenerId}`),
      listener,
    );

    // Listen for snapshot error events
    if (onError) {
      this._firestore.on(
        this._firestore._getAppEventName(`onDocumentSnapshotError:${listenerId}`),
        onError,
      );
    }

    // Add the native listener
    this._firestore._native
      .documentOnSnapshot(this.path, listenerId);

    // Return an unsubscribe method
    return this._offDocumentSnapshot.bind(this, listenerId, listener);
  }

  set(data: { [string]: any }, writeOptions?: WriteOptions): Promise<WriteResult> {
    return this._firestore._native
      .documentSet(this.path, data, writeOptions);
  }

  // TODO: Update to new update method signature
  update(data: { [string]: any }): Promise<WriteResult> {
    return this._firestore._native
      .documentUpdate(this.path, data);
  }

  /**
   * Remove document snapshot listener
   * @param listener
   */
  _offDocumentSnapshot(listenerId: number, listener: Function) {
    this._firestore.log.info('Removing onDocumentSnapshot listener');
    this._firestore.removeListener(this._firestore._getAppEventName(`onDocumentSnapshot:${listenerId}`), listener);
    this._firestore.removeListener(this._firestore._getAppEventName(`onDocumentSnapshotError:${listenerId}`), listener);
    this._firestore._native
      .documentOffSnapshot(this.path, listenerId);
  }
}
