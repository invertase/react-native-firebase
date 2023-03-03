// @flow
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  +getConstants: () => {|
    NATIVE_FIREBASE_APPS: Object,
    FIREBASE_RAW_JSON: string,
  |};

  +initializeApp: (options: Object, appConfig: Object) => Promise<Object>;
  +setAutomaticDataCollectionEnabled: (appName: string, enabled: boolean) => void;
  +deleteApp: (appName: string) => Promise<void>;
  +eventsNotifyReady: (ready: boolean) => void;
  +eventsGetListeners: () => Promise<Object>;
  +eventsPing: (eventName: string, eventBody: Object) => Promise<Object>;
  +eventsAddListener: (eventName: string) => void;
  +eventsRemoveListener: (eventName: string, all: boolean) => void;
  +addListener: (eventName: string) => void;
  +removeListeners: (count: Int32) => void;
  +metaGetAll: () => Promise<Object>;
  +jsonGetAll: () => Promise<Object>;
  +preferencesSetBool: (key: string, value: boolean) => Promise<void>;
  +preferencesSetString: (key: string, value: string) => Promise<void>;
  +preferencesGetAll: () => Promise<Object>;
  +preferencesClearAll: () => Promise<void>;
}
  
export default (TurboModuleRegistry.get<Spec>('RNFBAppModule'): ?Spec);
