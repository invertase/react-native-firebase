/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  once(
    app: string,
    dbURL: string,
    path: string,
    modifiers: ReadonlyArray<Object>,
    eventType: string,
  ): Promise<Object>;
  on(app: string, dbURL: string, props: Object): void;
  off(queryKey: string, eventRegistrationKey: string): void;
  keepSynced(
    app: string,
    dbURL: string,
    key: string,
    path: string,
    modifiers: ReadonlyArray<Object>,
    enabled: boolean,
  ): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboDatabaseQuery');
