import * as delegate from 'firebase/storage';
import { StorageReference, UploadTask, UploadTaskSnapshot } from '../types';
import UploadTaskSnapshotImpl from './uploadTaskSnapshot';
export default class UploadTaskImpl implements UploadTask {
  constructor(ref: StorageReference, task: delegate.UploadTask) {
    this._ref = ref;
    this._task = task;
  }

  private _ref: StorageReference;
  private _task: delegate.UploadTask;

  private getUploadTaskSnapshot(snapshot: delegate.UploadTaskSnapshot): UploadTaskSnapshot {
    return new UploadTaskSnapshotImpl(this._ref, this, snapshot);
  }

  get snapshot(): UploadTaskSnapshot {
    return this.getUploadTaskSnapshot(this._task.snapshot);
  }

  async cancel() {
    return this._task.cancel();
  }

  async resume() {
    return this._task.resume();
  }

  async pause() {
    return this._task.pause();
  }

  async then(onFulfilled?: (snapshot: UploadTaskSnapshot) => unknown): Promise<unknown> {
    return this._task.then(snapshot => {
      onFulfilled?.(this.getUploadTaskSnapshot(snapshot));
    });
  }

  async catch(onRejected?: (error: any) => unknown): Promise<unknown> {
    return this._task.catch(error => {
      onRejected?.(error);
    });
  }

  on(
    event: delegate.TaskEvent,
    observer?: (snapshot: UploadTaskSnapshot) => unknown,
    onError?: (error: any) => unknown,
  ) {
    return this._task.on(
      event,
      snapshot => {
        observer?.(this.getUploadTaskSnapshot(snapshot));
      },
      error => {
        onError?.(error);
      },
    );
  }
}
