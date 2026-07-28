/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  set(app: string, dbURL: string, path: string, props: Object): Promise<void>;
  update(app: string, dbURL: string, path: string, props: Object): Promise<void>;
  setWithPriority(app: string, dbURL: string, path: string, props: Object): Promise<void>;
  remove(app: string, dbURL: string, path: string): Promise<void>;
  setPriority(app: string, dbURL: string, path: string, props: Object): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboDatabaseReference');
