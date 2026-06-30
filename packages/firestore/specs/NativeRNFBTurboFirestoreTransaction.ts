/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  transactionBegin(appName: string, databaseId: string, transactionId: number): void;
  transactionGetDocument(
    appName: string,
    databaseId: string,
    transactionId: number,
    path: string,
  ): Promise<Object>;
  transactionDispose(appName: string, databaseId: string, transactionId: number): void;
  transactionApplyBuffer(
    appName: string,
    databaseId: string,
    transactionId: number,
    commandBuffer: Object[],
  ): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboFirestoreTransaction');
