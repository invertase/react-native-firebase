import { FirebaseApp } from '@react-native-firebase/app-exp';
import { StorageService } from '../types';

/**
 * A cast-able internal interface for the StorageService.
 *
 * Internally the properties of this interface can be accessed however
 * are not visible to the end-user.
 */
export interface StorageServiceInternal {
  /**
   * The emulator host (ex: localhost).
   */
  host?: string;

  /**
   * The emulator port (ex: 5001).
   */
  port?: number;
}

/**
 * Additional optional configuration options when creating a StorageService instance.
 */
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

  host?: string;
  port?: number;
}
