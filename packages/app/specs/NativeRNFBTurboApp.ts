/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type FirebaseAppConfig = {
  name: string;
  automaticResourceManagement?: boolean;
  automaticDataCollectionEnabled?: boolean;
};

export type FirebaseAppOptions = {
  apiKey: string;
  appId: string;
  databaseURL?: string | null;
  messagingSenderId: string;
  projectId: string;
  storageBucket?: string | null;
  authDomain?: string | null;
  iosBundleId?: string | null;
  iosClientId?: string | null;
  appGroupId?: string | null;
};

export type NativeFirebaseApp = {
  appConfig: FirebaseAppConfig;
  options: FirebaseAppOptions;
};

export interface Spec extends TurboModule {
  getConstants(): {
    NATIVE_FIREBASE_APPS: Array<NativeFirebaseApp>;
    FIREBASE_RAW_JSON: string;
  };

  initializeApp(options: Object, appConfig: Object): Promise<Object>;
  setAutomaticDataCollectionEnabled(appName: string, enabled: boolean): void;
  deleteApp(appName: string): Promise<Object | null>;

  eventsNotifyReady(ready: boolean): void;
  eventsGetListeners(): Promise<Object>;
  eventsPing(eventName: string, eventBody: Object): Promise<Object>;
  eventsAddListener(eventName: string): void;
  eventsRemoveListener(eventName: string, all: boolean): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;

  metaGetAll(): Promise<Object>;
  jsonGetAll(): Promise<Object>;
  preferencesSetBool(key: string, value: boolean): Promise<Object | null>;
  preferencesSetString(key: string, value: string): Promise<Object | null>;
  preferencesGetAll(): Promise<Object>;
  preferencesClearAll(): Promise<Object | null>;

  setLogLevel(logLevel: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboApp');
