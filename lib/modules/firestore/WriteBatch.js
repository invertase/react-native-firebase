/**
 * @flow
 * WriteBatch representation wrapper
 */
import DocumentReference from './DocumentReference';

import type { DeleteOptions, WriteOptions, WriteResult } from './DocumentReference';

type CommitOptions = {
    transactionId: string,
}

type DocumentWrite = {
  data?: Object,
  options?: Object,
  path: string,
  type: 'DELETE' | 'SET' | 'UPDATE',
}

 /**
 * @class WriteBatch
 */
export default class WriteBatch {
  _firestore: Object;
  _writes: DocumentWrite[];

  constructor(firestore: Object) {
    this._firestore = firestore;
    this._writes = [];
  }

  get firestore(): Object {
    return this._firestore;
  }

  get isEmpty(): boolean {
    return this._writes.length === 0;
  }

  create(docRef: DocumentReference, data: Object): WriteBatch {
    // TODO: Validation
    // validate.isDocumentReference('docRef', docRef);
    // validate.isDocument('data', data);

    return this.set(docRef, data, { exists: false });
  }

  delete(docRef: DocumentReference, deleteOptions?: DeleteOptions): WriteBatch {
    // TODO: Validation
    // validate.isDocumentReference('docRef', docRef);
    // validate.isOptionalPrecondition('deleteOptions', deleteOptions);
    this._writes.push({
      options: deleteOptions,
      path: docRef.path,
      type: 'DELETE',
    });

    return this;
  }

  set(docRef: DocumentReference, data: Object, writeOptions?: WriteOptions) {
    // TODO: Validation
    // validate.isDocumentReference('docRef', docRef);
    // validate.isDocument('data', data);
    // validate.isOptionalPrecondition('writeOptions', writeOptions);

    this._writes.push({
      data,
      options: writeOptions,
      path: docRef.path,
      type: 'SET',
    });

    return this;
  }

  // TODO: Update to new method signature
  update(docRef: DocumentReference, data: { [string]: any }): WriteBatch {
    // TODO: Validation
    // validate.isDocumentReference('docRef', docRef);
    // validate.isDocument('data', data, true);

    this._writes.push({
      data,
      path: docRef.path,
      type: 'UPDATE',
    });

    return this;
  }

  commit(commitOptions?: CommitOptions): Promise<WriteResult[]> {
    return this._firestore._native
      .documentBatch(this._writes, commitOptions);
  }
}
