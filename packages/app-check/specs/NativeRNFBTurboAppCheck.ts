import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface AppCheckTokenResult {
  token: string;
}

export interface Spec extends TurboModule {
  activate(
    appName: string,
    siteKeyProvider: string,
    isTokenAutoRefreshEnabled: boolean,
  ): Promise<void>;
  configureProvider(
    appName: string,
    providerName: string,
    debugToken?: string | null,
  ): Promise<void>;
  setTokenAutoRefreshEnabled(appName: string, isTokenAutoRefreshEnabled: boolean): void;
  isTokenAutoRefreshEnabled(appName: string): Promise<boolean>;
  getToken(appName: string, forceRefresh: boolean): Promise<AppCheckTokenResult>;
  getLimitedUseToken(appName: string): Promise<AppCheckTokenResult>;
  addAppCheckListener(appName: string): void;
  removeAppCheckListener(appName: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboAppCheck');
