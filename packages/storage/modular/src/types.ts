import * as web from 'firebase/storage';
import { FirebaseApp } from '@react-native-firebase-modular/app';

export interface StorageService extends web.StorageService {
  readonly app: FirebaseApp;
  readonly maxOperationRetryTime: number;
  readonly maxDownloadRetryTime: number;
  readonly maxUploadRetryTime: number;
  readonly bucket: string;
}

export interface StorageReference extends web.StorageReference {
  readonly parent: StorageReference | null;
  readonly root: StorageReference;
  readonly storage: StorageService;
}

export interface ListResult extends web.ListResult {
  readonly items: StorageReference[];
  readonly nextPageToken?: string;
  readonly prefixes: StorageReference[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FullMetadata extends web.FullMetadata {
  // readonly contentDisposition?: string;
  // readonly contentEncoding?: string;
  // readonly contentLanguage?: string;
  // readonly contentType?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SettableMetadata extends web.SettableMetadata {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ListOptions extends web.ListOptions {}
