/**
 * @flow
 * DocumentSnapshot representation wrapper
 */
import DocumentReference from './DocumentReference';
import Path from './Path';
import INTERNALS from './../../internals';

export type DocumentSnapshotNativeData = {
  createTime: string,
  data: Object,
  path: string,
  readTime: string,
  updateTime: string,
}

/**
 * @class DocumentSnapshot
 */
export default class DocumentSnapshot {
  _createTime: string;
  _data: Object;
  _readTime: string;
  _ref: DocumentReference;
  _updateTime: string;

  constructor(firestore: Object, nativeData: DocumentSnapshotNativeData) {
    this._createTime = nativeData.createTime;
    this._data = nativeData.data;
    this._ref = new DocumentReference(firestore, Path.fromName(nativeData.path));
    this._readTime = nativeData.readTime;
    this._updateTime = nativeData.updateTime;
  }

  get createTime(): string {
    // return this._createTime;
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_PROPERTY('DocumentSnapshot', 'createTime'));
  }

  get exists(): boolean {
    return this._data !== undefined;
  }

  get id(): string | null {
    return this._ref.id;
  }

  get readTime(): string {
    // return this._readTime;
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_PROPERTY('DocumentSnapshot', 'readTime'));
  }

  get ref(): DocumentReference {
    return this._ref;
  }

  get updateTime(): string {
    // return this._updateTime;
    throw new Error(INTERNALS.STRINGS.ERROR_UNSUPPORTED_CLASS_PROPERTY('DocumentSnapshot', 'updateTime'));
  }

  data(): Object {
    return this._data;
  }

  get(fieldPath: string): any {
    return this._data[fieldPath];
  }
}
