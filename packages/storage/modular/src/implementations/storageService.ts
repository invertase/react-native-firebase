import { FirebaseApp } from '@react-native-firebase-modular/app';
import { StorageService } from '../types';

type StorageServiceImplOptions = {
  bucket?: string;
  maxOperationRetryTime?: number;
  maxDownloadRetryTime?: number;
  maxUploadRetryTime?: number;
};

export default class StorageServiceImpl implements StorageService {
  constructor(app: FirebaseApp, options?: StorageServiceImplOptions) {
    this.app = app;
    this.maxOperationRetryTime = options?.maxOperationRetryTime ?? 0;
    this.maxDownloadRetryTime = options?.maxDownloadRetryTime ?? 0;
    this.maxUploadRetryTime = options?.maxOperationRetryTime ?? 0;
    this.bucket = (options?.bucket ?? app.options.storageBucket).replace('gs://', '');
  }

  readonly app: FirebaseApp;
  readonly maxOperationRetryTime: number;
  readonly maxDownloadRetryTime: number;
  readonly maxUploadRetryTime: number;
  readonly bucket: string;
}
