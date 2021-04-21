import { FirebaseAppConfig, FirebaseOptions } from '../types';
import { getNativeModule } from './native';
interface AppModule {
  readonly NATIVE_FIREBASE_APPS: NativeFirebaseApp[];
  readonly FIREBASE_RAW_JSON: string;
  deleteApp(name: string): Promise<void>;
  initializeApp(options: FirebaseOptions, config: FirebaseAppConfig): Promise<void>;
  setAutomaticDataCollectionEnabled(name: string, enabled: boolean): Promise<void>;
}

type NativeFirebaseApp = {
  appConfig: {
    name: string;
    automaticDataCollectionEnabled: boolean;
  };
  options: {
    apiKey: string;
    appId: string;
    projectId: string;
    databaseURL: string;
    gaTrackingId: string;
    storageBucket: string;
  };
};

export const bridge = getNativeModule<AppModule>({
  namespace: 'app',
  nativeModule: 'RNFBAppModule',
  config: {
    events: [],
    // hasMultiAppSupport: true,
    hasCustomUrlOrRegionSupport: false,
  },
});
