/**
 * @flow
 * DocumentSnapshot representation wrapper
 */
import DocumentReference from './DocumentReference';
import Path from './Path';
import { parseNativeMap } from './utils/serialize';

import type Firestore from './';
import type { FirestoreNativeDocumentSnapshot, FirestoreSnapshotMetadata } from '../../types';

/**
 * @class DocumentSnapshot
 */
export default class DocumentSnapshot {
  _data: Object | void;
  _metadata: FirestoreSnapshotMetadata;
  _ref: DocumentReference;

  constructor(firestore: Firestore, nativeData: FirestoreNativeDocumentSnapshot) {
    this._data = parseNativeMap(firestore, nativeData.data);
    this._metadata = nativeData.metadata;
    this._ref = new DocumentReference(firestore, Path.fromName(nativeData.path));
  }

  get exists(): boolean {
    return this._data !== undefined;
  }

  get id(): string | null {
    return this._ref.id;
  }

  get metadata(): FirestoreSnapshotMetadata {
    return this._metadata;
  }

  get ref(): DocumentReference {
    return this._ref;
  }

  data(): Object | void {
    return this._data;
  }

  get(fieldPath: string): any {
    return this._data ? this._data[fieldPath] : undefined;
  }
}
