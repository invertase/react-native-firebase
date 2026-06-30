/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type FirestoreSnapshotListenOptions = {
  includeMetadataChanges?: boolean;
  source?: string;
};

export interface Spec extends TurboModule {
  documentOnSnapshot(
    appName: string,
    databaseId: string,
    path: string,
    listenerId: number,
    snapshotListenOptions: FirestoreSnapshotListenOptions,
  ): void;
  documentOffSnapshot(appName: string, databaseId: string, listenerId: number): void;
  documentGet(
    appName: string,
    databaseId: string,
    path: string,
    getOptions?: { source?: string },
  ): Promise<Object>;
  documentDelete(appName: string, databaseId: string, path: string): Promise<void>;
  documentSet(
    appName: string,
    databaseId: string,
    path: string,
    data: Object,
    options: Object,
  ): Promise<void>;
  documentUpdate(appName: string, databaseId: string, path: string, data: Object): Promise<void>;
  documentBatch(appName: string, databaseId: string, writes: Object[]): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboFirestoreDocument');
