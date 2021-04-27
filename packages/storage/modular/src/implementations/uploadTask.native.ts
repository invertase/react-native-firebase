import { FirebaseError } from '@react-native-firebase-modular/app/internal';
import { UploadTask } from '../types';

export type UploadTaskCommand = () => Promise<boolean>;

export type OnUploadTaskError = (error: FirebaseError) => Promise<unknown>;

export type OnUploadTaskSuccess = (
  onFulfilled?: (snapshot: any) => unknown | null,
  onRejected?: (error: FirebaseError) => unknown | null,
) => Promise<unknown>;

type UploadTaskImplArguments = {
  onCancel: UploadTaskCommand;
  onResume: UploadTaskCommand;
  onPause: UploadTaskCommand;
  onError: OnUploadTaskError;
  onSuccess: OnUploadTaskSuccess;
};

export default class UploadTaskImpl implements UploadTask {
  constructor(args: UploadTaskImplArguments) {
    this.onCancel = args.onCancel;
    this.onResume = args.onResume;
    this.onPause = args.onPause;
    this.onError = args.onError;
    this.onSuccess = args.onSuccess;
  }

  readonly snapshot: any;

  private onCancel: UploadTaskCommand;
  private onResume: UploadTaskCommand;
  private onPause: UploadTaskCommand;
  private onError: OnUploadTaskError;
  private onSuccess: OnUploadTaskSuccess;

  cancel(): Promise<boolean> {
    return this.onCancel();
  }

  pause(): Promise<boolean> {
    return this.onPause();
  }

  resume(): Promise<boolean> {
    return this.onResume();
  }

  then() {
    return this.onSuccess();
  }

  catch() {
    return this.onError();
  }

  on() {}
}
