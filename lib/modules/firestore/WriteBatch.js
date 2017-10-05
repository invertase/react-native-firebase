/**
 * @flow
 * WriteBatch representation wrapper
 */
import DocumentReference from './DocumentReference';

import type { WriteOptions } from './DocumentReference';

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

  commit(): Promise<void> {
    return this._firestore._native
      .documentBatch(this._writes);
  }

  delete(docRef: DocumentReference): WriteBatch {
    // TODO: Validation
    // validate.isDocumentReference('docRef', docRef);
    // validate.isOptionalPrecondition('deleteOptions', deleteOptions);
    this._writes.push({
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
  update(docRef: DocumentReference, data: Object): WriteBatch {
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
}
