/**
 * @flow
 * DocumentSnapshot representation wrapper
 */
import DocumentReference from './DocumentReference';
import Path from './Path';
import { parseNativeMap } from './utils/serialize';

export type SnapshotMetadata = {
  fromCache: boolean,
  hasPendingWrites: boolean,
}

export type DocumentSnapshotNativeData = {
  data: Object,
  metadata: SnapshotMetadata,
  path: string,
}

/**
 * @class DocumentSnapshot
 */
export default class DocumentSnapshot {
  _data: Object;
  _metadata: SnapshotMetadata;
  _ref: DocumentReference;

  constructor(firestore: Object, nativeData: DocumentSnapshotNativeData) {
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

  get metadata(): SnapshotMetadata {
    return this._metadata;
  }

  get ref(): DocumentReference {
    return this._ref;
  }

  data(): Object {
    return this._data;
  }

  get(fieldPath: string): any {
    return this._data[fieldPath];
  }
}
