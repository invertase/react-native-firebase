/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type FirestoreLoadBundleTaskProgress = {
  bytesLoaded: number;
  documentsLoaded: number;
  totalBytes: number;
  totalDocuments: number;
  taskState: 'Running' | 'Success' | 'Error';
};

export interface Spec extends TurboModule {
  setLogLevel(logLevel: string): void;
  loadBundle(
    appName: string,
    databaseId: string,
    bundle: string,
  ): Promise<FirestoreLoadBundleTaskProgress>;
  clearPersistence(appName: string, databaseId: string): Promise<void>;
  waitForPendingWrites(appName: string, databaseId: string): Promise<void>;
  disableNetwork(appName: string, databaseId: string): Promise<void>;
  enableNetwork(appName: string, databaseId: string): Promise<void>;
  useEmulator(appName: string, databaseId: string, host: string, port: number): void;
  settings(appName: string, databaseId: string, settings: Object): Promise<void>;
  terminate(appName: string, databaseId: string): Promise<void>;
  persistenceCacheIndexManager(
    appName: string,
    databaseId: string,
    requestType: number,
  ): Promise<void>;
  addSnapshotsInSync(appName: string, databaseId: string, listenerId: number): void;
  removeSnapshotsInSync(appName: string, databaseId: string, listenerId: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboFirestore');
