import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  goOnline(app: string, dbURL: string): Promise<void>;
  goOffline(app: string, dbURL: string): Promise<void>;
  setPersistenceEnabled(app: string, dbURL: string, enabled: boolean): void;
  setLoggingEnabled(app: string, dbURL: string, enabled: boolean): void;
  setPersistenceCacheSizeBytes(app: string, dbURL: string, cacheSizeBytes: number): void;
  useEmulator(app: string, dbURL: string, host: string, port: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboDatabase');
