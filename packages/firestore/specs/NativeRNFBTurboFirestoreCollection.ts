/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type FirestoreCollectionCountResult = {
  count?: number;
};

export interface Spec extends TurboModule {
  namedQueryOnSnapshot(
    appName: string,
    databaseId: string,
    queryName: string,
    type: string,
    filters: ReadonlyArray<Object>,
    orders: ReadonlyArray<Object>,
    options: Object,
    listenerId: number,
    snapshotListenOptions: Object,
  ): void;
  collectionOnSnapshot(
    appName: string,
    databaseId: string,
    path: string,
    type: string,
    filters: ReadonlyArray<Object>,
    orders: ReadonlyArray<Object>,
    options: Object,
    listenerId: number,
    snapshotListenOptions: Object,
  ): void;
  collectionOffSnapshot(appName: string, databaseId: string, listenerId: number): void;
  namedQueryGet(
    appName: string,
    databaseId: string,
    queryName: string,
    type: string,
    filters: ReadonlyArray<Object>,
    orders: ReadonlyArray<Object>,
    options: Object,
    getOptions?: Object,
  ): Promise<Object>;
  collectionGet(
    appName: string,
    databaseId: string,
    path: string,
    type: string,
    filters: ReadonlyArray<Object>,
    orders: ReadonlyArray<Object>,
    options: Object,
    getOptions?: Object,
  ): Promise<Object>;
  collectionCount(
    appName: string,
    databaseId: string,
    path: string,
    type: string,
    filters: ReadonlyArray<Object>,
    orders: ReadonlyArray<Object>,
    options: Object,
  ): Promise<FirestoreCollectionCountResult>;
  aggregateQuery(
    appName: string,
    databaseId: string,
    path: string,
    type: string,
    filters: ReadonlyArray<Object>,
    orders: ReadonlyArray<Object>,
    options: Object,
    aggregateQueries: ReadonlyArray<Object>,
  ): Promise<Object>;
  pipelineExecute(
    appName: string,
    databaseId: string,
    pipeline: Object,
    options?: Object,
  ): Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboFirestoreCollection');
