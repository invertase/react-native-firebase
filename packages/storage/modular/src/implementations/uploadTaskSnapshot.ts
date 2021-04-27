import * as delegate from 'firebase/storage';
import { FullMetadata, StorageReference, UploadTask, UploadTaskSnapshot } from '../types';
import { toFullMetadata } from '../validation';

export default class UploadTaskSnapshotImpl implements UploadTaskSnapshot {
  constructor(ref: StorageReference, task: UploadTask, snapshot: delegate.UploadTaskSnapshot) {
    this._ref = ref;
    this._task = task;
    this._snapshot = snapshot;
  }

  private _snapshot: delegate.UploadTaskSnapshot;
  private _task: UploadTask;
  private _ref: StorageReference;

  get bytesTransferred(): number {
    return this._snapshot.bytesTransferred;
  }

  get totalBytes(): number {
    return this._snapshot.totalBytes;
  }

  get metadata(): FullMetadata {
    return toFullMetadata(this._snapshot.metadata, this._ref);
  }

  get ref(): StorageReference {
    return this._ref;
  }

  get state(): delegate.TaskState {
    return this._snapshot.state;
  }

  get task(): UploadTask {
    return this._task;
  }
}
