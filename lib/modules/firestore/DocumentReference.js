/**
 * @flow
 * DocumentReference representation wrapper
 */
import CollectionReference from './CollectionReference';
import DocumentSnapshot from './DocumentSnapshot';
import Path from './Path';

export type DeleteOptions = {
  lastUpdateTime?: string,
}

export type UpdateOptions = {
  createIfMissing?: boolean,
  lastUpdateTime?: string,
}

export type WriteOptions = {
  createIfMissing?: boolean,
  lastUpdateTime?: string,
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
    return this._firestore._native
      .documentCreate(this._documentPath._parts, data);
  }

  delete(deleteOptions?: DeleteOptions): Promise<WriteResult> {
    return this._firestore._native
      .documentDelete(this._documentPath._parts, deleteOptions);
  }

  get(): Promise<DocumentSnapshot> {
    return this._firestore._native
      .documentGet(this._documentPath._parts)
      .then(result => new DocumentSnapshot(this._firestore, result));
  }

  getCollections(): Promise<CollectionReference[]> {
    return this._firestore._native
      .documentCollections(this._documentPath._parts)
      .then((collectionIds) => {
        const collections = [];

        for (const collectionId of collectionIds) {
          collections.push(this.collection(collectionId));
        }

        return collections;
      });
  }

  onSnapshot(onNext: () => any, onError?: () => any): () => void {
    // TODO
  }

  set(data: { [string]: any }, writeOptions?: WriteOptions): Promise<WriteResult> {
    return this._firestore._native
      .documentSet(this._documentPath._parts, data, writeOptions);
  }

  update(data: { [string]: any }, updateOptions?: UpdateOptions): Promise<WriteResult> {
    return this._firestore._native
      .documentUpdate(this._documentPath._parts, data, updateOptions);
  }

  /**
   * INTERNALS
   */

  /**
  * Generate a string that uniquely identifies this DocumentReference
  *
  * @return {string}
  * @private
  */
  _getDocumentKey() {
    return `$${this._firestore._appName}$/${this._documentPath._parts.join('/')}`;
  }
}
