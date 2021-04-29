import { StorageReference, TaskEvent, UploadTask, UploadTaskSnapshot } from '../types';
import UploadTaskSnapshotImpl from './uploadTaskSnapshot.native';
import { NativeTaskSnapshot } from '../impl.native';

type OnCreateTaskCallback = (taskId: number) => Promise<NativeTaskSnapshot>;

type OnSetTaskStatusCallback = (taskId: number, status: any) => Promise<boolean>;

type OnSetTaskEventCallback = (taskId: number, callbacks: TaskEventCallbacks) => () => void;

type TaskEventCallbacks = {
  onStateChanged: (snapshot: NativeTaskSnapshot) => void;
  onFailure: (error: any) => void;
  onSuccess: (snapshot: NativeTaskSnapshot) => void;
};

type UploadTaskImplConfig = {
  onTaskCreate: OnCreateTaskCallback;
  onSetTaskStatus: OnSetTaskStatusCallback;
  onTaskEvent: OnSetTaskEventCallback;
};

// Internal task ID tracking
let TASK_ID = 0;

export default class UploadTaskImpl implements UploadTask {
  constructor(ref: StorageReference, config: UploadTaskImplConfig) {
    this._ref = ref;
    this._id = TASK_ID++;
    this._config = config;
    this._promise = null;
    this._snapshot = null;
  }

  private _ref: StorageReference;
  private _id: number;
  private _config: UploadTaskImplConfig;
  private _promise: Promise<NativeTaskSnapshot> | null;
  private _snapshot: UploadTaskSnapshot | null;

  get snapshot(): UploadTaskSnapshot {
    if (!this._snapshot) {
      return UploadTaskSnapshotImpl.stub(this._ref, this);
    }

    return this._snapshot;
  }

  cancel(): Promise<boolean> {
    // TODO enum
    return this._config.onSetTaskStatus(this._id, 2);
  }

  pause(): Promise<boolean> {
    // TODO enum
    return this._config.onSetTaskStatus(this._id, 0);
  }

  resume(): Promise<boolean> {
    // TODO enum
    return this._config.onSetTaskStatus(this._id, 1);
  }

  async then(onFulfilled?: (snapshot: UploadTaskSnapshot) => unknown): Promise<unknown> {
    if (!this._promise) {
      this._promise = this._config.onTaskCreate(this._id);
    }

    return this._promise.then(nativeSnapshot => {
      this._snapshot = new UploadTaskSnapshotImpl(this._ref, this, nativeSnapshot);
      onFulfilled?.(this._snapshot);
    });
  }

  async catch(onRejected?: (error: any) => unknown) {
    if (!this._promise) {
      this._promise = this._config.onTaskCreate(this._id);
    }

    return this._promise.catch(error => {
      onRejected?.(error);
    });
  }

  on(
    event: typeof TaskEvent,
    observer?: (snapshot: UploadTaskSnapshot) => unknown,
    onError?: (error: any) => unknown,
  ) {
    return this._config.onTaskEvent(this._id, {
      onFailure(error) {
        onError?.(error);
      },
      onSuccess: nativeSnapshot => {
        this._snapshot = new UploadTaskSnapshotImpl(this._ref, this, nativeSnapshot);
        observer?.(this._snapshot);
      },
      onStateChanged: nativeSnapshot => {
        this._snapshot = new UploadTaskSnapshotImpl(this._ref, this, nativeSnapshot);
        observer?.(this._snapshot);
      },
    });
  }
}
