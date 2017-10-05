/**
 * @flow
 * DocumentReference representation wrapper
 */
import CollectionReference from './CollectionReference';
import DocumentSnapshot from './DocumentSnapshot';
import Path from './Path';
import { firestoreAutoId } from '../../utils';

export type WriteOptions = {
  merge?: boolean,
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

  get parent(): CollectionReference {
    const parentPath = this._documentPath.parent();
    return new CollectionReference(this._firestore, parentPath);
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

  delete(): Promise<void> {
    return this._firestore._native
      .documentDelete(this.path);
  }

  get(): Promise<DocumentSnapshot> {
    return this._firestore._native
      .documentGet(this.path)
      .then(result => new DocumentSnapshot(this._firestore, result));
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

  set(data: Object, writeOptions?: WriteOptions): Promise<void> {
    return this._firestore._native
      .documentSet(this.path, data, writeOptions);
  }

  update(data: Object): Promise<void> {
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
