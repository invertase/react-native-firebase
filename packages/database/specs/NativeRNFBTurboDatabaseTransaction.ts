/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  transactionStart(
    app: string,
    dbURL: string,
    path: string,
    transactionId: number,
    applyLocally: boolean,
  ): void;
  transactionTryCommit(app: string, dbURL: string, transactionId: number, updates: Object): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboDatabaseTransaction');
