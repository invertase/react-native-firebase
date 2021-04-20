import { FirebaseOptions } from '../types';
import { getNativeModule } from './native';
interface AppModule {
  readonly NATIVE_FIREBASE_APPS: any[];
  deleteApp(name: string): Promise<void>;
  initializeApp(options: FirebaseOptions, config: { name: string }): Promise<void>;
}

export const bridge = getNativeModule<AppModule>({
  namespace: 'app',
  nativeModule: 'RNFBAppModule',
  config: {
    events: [],
    hasMultiAppSupport: true,
    hasCustomUrlOrRegionSupport: false,
  },
});
