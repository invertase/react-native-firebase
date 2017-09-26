/**
 * @flow
 * WriteBatch representation wrapper
 */
import DocumentReference from './DocumentReference';

import type { DeleteOptions, UpdateOptions, WriteOptions, WriteResult } from './DocumentReference';

type CommitOptions = {
    transactionId: string,
}

type DocumentWrite = {
  data?: Object,
  options?: Object,
  path: string[],
  type: 'delete' | 'set' | 'update',
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
      path: docRef._documentPath._parts,
      type: 'delete',
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
      path: docRef._documentPath._parts,
      type: 'set',
    });

    // TODO: DocumentTransform ?!
    // let documentTransform = DocumentTransform.fromObject(docRef, data);

    // if (!documentTransform.isEmpty) {
      // this._writes.push({transform: documentTransform.toProto()});
    // }

    return this;
  }

  update(docRef: DocumentReference, data: Object, updateOptions: UpdateOptions): WriteBatch {
    // TODO: Validation
    // validate.isDocumentReference('docRef', docRef);
    // validate.isDocument('data', data, true);
    // validate.isOptionalPrecondition('updateOptions', updateOptions);

    this._writes.push({
      data,
      options: updateOptions,
      path: docRef._documentPath._parts,
      type: 'update',
    });

    // TODO: DocumentTransform ?!
    // let documentTransform = DocumentTransform.fromObject(docRef, expandedObject);

    // if (!documentTransform.isEmpty) {
      // this._writes.push({transform: documentTransform.toProto()});
    // }

    return this;
  }

  commit(commitOptions?: CommitOptions): Promise<WriteResult[]> {
    return this._firestore._native
      .documentBatch(this._writes, commitOptions);
  }
}
