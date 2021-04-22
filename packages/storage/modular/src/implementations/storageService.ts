import { FirebaseApp } from '@react-native-firebase-modular/app';
import { StorageService } from '../types';

type StorageServiceImplOptions = {
  bucket?: string;
  maxOperationRetryTime?: number;
  maxUploadRetryTime?: number;
};

export default class StorageServiceImpl implements StorageService {
  constructor(app: FirebaseApp, options?: StorageServiceImplOptions) {
    this.app = app;
    this.maxOperationRetryTime = options?.maxOperationRetryTime ?? 60;
    this.maxUploadRetryTime = options?.maxOperationRetryTime ?? 60;
    this.bucket = options?.bucket ?? app.options.storageBucket ?? '';
  }

  readonly app: FirebaseApp;
  readonly maxOperationRetryTime: number;
  readonly maxUploadRetryTime: number;
  readonly bucket: string;
}
