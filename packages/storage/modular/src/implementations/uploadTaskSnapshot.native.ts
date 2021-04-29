import {
  FullMetadata,
  StorageReference,
  TaskState,
  UploadTask,
  UploadTaskSnapshot,
} from '../types';
import { toFullMetadata } from '../validation';
import { NativeTaskSnapshot } from '../impl.native';

export default class UploadTaskSnapshotImpl implements UploadTaskSnapshot {
  // Used for cases where the user requests a snapshot of a task which has not
  // yet resolved or responded from the native request.
  public static stub(ref: StorageReference, task: UploadTask) {
    return new UploadTaskSnapshotImpl(ref, task, {
      totalBytes: 0,
      bytesTransferred: 0,
      metadata: {} as FullMetadata,
      state: 'running',
    });
  }

  constructor(ref: StorageReference, task: UploadTask, snapshot: NativeTaskSnapshot) {
    this._ref = ref;
    this._task = task;
    this._snapshot = snapshot;
  }

  private _snapshot: NativeTaskSnapshot;
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

  get state(): TaskState {
    return this._snapshot.state;
  }

  get task(): UploadTask {
    return this._task;
  }
}
