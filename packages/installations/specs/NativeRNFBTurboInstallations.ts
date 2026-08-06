import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  deleteInstallations(appName: string): Promise<void>;
  getId(appName: string): Promise<string>;
  getToken(appName: string, forceRefresh: boolean): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboInstallations');
