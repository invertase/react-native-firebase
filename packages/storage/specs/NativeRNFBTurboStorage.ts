/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface StorageListOptions {
  maxResults: number;
  pageToken?: string | null;
}

export interface Spec extends TurboModule {
  getConstants(): {
    maxDownloadRetryTime: number;
    maxOperationRetryTime: number;
    maxUploadRetryTime: number;
  };

  deleteObject(appName: string, url: string): Promise<void>;
  getDownloadURL(appName: string, url: string): Promise<string>;
  getMetadata(appName: string, url: string): Promise<Object>;
  updateMetadata(appName: string, url: string, metadata: Object | null): Promise<Object>;
  list(appName: string, url: string, listOptions: StorageListOptions): Promise<Object>;
  listAll(appName: string, url: string): Promise<Object>;
  setMaxDownloadRetryTime(appName: string, milliseconds: number): Promise<void>;
  setMaxOperationRetryTime(appName: string, milliseconds: number): Promise<void>;
  setMaxUploadRetryTime(appName: string, milliseconds: number): Promise<void>;
  useEmulator(appName: string, host: string, port: number, bucketUrl: string): void;
  writeToFile(appName: string, url: string, localFilePath: string, taskId: number): Promise<Object>;
  putFile(
    appName: string,
    url: string,
    localFilePath: string,
    metadata: Object | null,
    taskId: number,
  ): Promise<Object>;
  putString(
    appName: string,
    url: string,
    string: string,
    format: string,
    metadata: Object | null,
    taskId: number,
  ): Promise<Object>;
  setTaskStatus(appName: string, taskId: number, status: number): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboStorage');
