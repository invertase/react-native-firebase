import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type LastFetchStatus = 'success' | 'failure' | 'no_fetch_yet' | 'throttled' | 'unknown';

export interface StoredConfigValue {
  value: string | number | boolean;
  source: 'default' | 'remote' | 'static' | 'unknown';
}

export interface RemoteConfigConstants {
  fetchTimeout: number;
  minimumFetchInterval: number;
  lastFetchTime: number;
  lastFetchStatus: LastFetchStatus;
  values: { [key: string]: StoredConfigValue };
}

export interface BooleanRemoteConfigResult {
  result: boolean;
  constants: RemoteConfigConstants;
}

export interface NullRemoteConfigResult {
  result: string | null;
  constants: RemoteConfigConstants;
}

export interface VoidRemoteConfigResult {
  constants: RemoteConfigConstants;
}

export interface ConfigSettings {
  fetchTimeout: number;
  minimumFetchInterval: number;
}

export interface Spec extends TurboModule {
  getConstants(): RemoteConfigConstants;

  activate(appName: string): Promise<BooleanRemoteConfigResult>;
  setConfigSettings(appName: string, settings: ConfigSettings): Promise<VoidRemoteConfigResult>;
  fetch(appName: string, expirationDurationSeconds: number): Promise<VoidRemoteConfigResult>;
  fetchAndActivate(appName: string): Promise<BooleanRemoteConfigResult>;
  ensureInitialized(appName: string): Promise<VoidRemoteConfigResult>;
  setDefaults(
    appName: string,
    defaults: { [key: string]: string | number | boolean },
  ): Promise<NullRemoteConfigResult>;
  setDefaultsFromResource(appName: string, resourceName: string): Promise<NullRemoteConfigResult>;
  reset(appName: string): Promise<VoidRemoteConfigResult>;
  onConfigUpdated(appName: string): void;
  removeConfigUpdateRegistration(appName: string): void;
  setCustomSignals(
    appName: string,
    customSignals: { [key: string]: string | number | null },
  ): Promise<VoidRemoteConfigResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboConfig');
