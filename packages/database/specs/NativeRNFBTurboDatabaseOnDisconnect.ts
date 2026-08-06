/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  onDisconnectCancel(app: string, dbURL: string, path: string): Promise<void>;
  onDisconnectRemove(app: string, dbURL: string, path: string): Promise<void>;
  onDisconnectSet(app: string, dbURL: string, path: string, props: Object): Promise<void>;
  onDisconnectSetWithPriority(
    app: string,
    dbURL: string,
    path: string,
    props: Object,
  ): Promise<void>;
  onDisconnectUpdate(app: string, dbURL: string, path: string, props: Object): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboDatabaseOnDisconnect');
