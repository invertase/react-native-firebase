import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type PlayServicesAvailability = {
  isAvailable: boolean;
  status: number;
  hasResolution: boolean;
  isUserResolvableError: boolean;
  error?: string;
};

export interface Spec extends TurboModule {
  getConstants(): {
    isRunningInTestLab: boolean;
    MAIN_BUNDLE: string;
    CACHES_DIRECTORY: string;
    DOCUMENT_DIRECTORY: string;
    EXTERNAL_DIRECTORY?: string;
    EXTERNAL_STORAGE_DIRECTORY?: string;
    TEMP_DIRECTORY: string;
    LIBRARY_DIRECTORY: string;
    PICTURES_DIRECTORY: string;
    MOVIES_DIRECTORY: string;
    FILE_TYPE_REGULAR?: string;
    FILE_TYPE_DIRECTORY?: string;
  };

  androidGetPlayServicesStatus(): Promise<PlayServicesAvailability>;
  androidPromptForPlayServices(): Promise<void>;
  androidResolutionForPlayServices(): Promise<void>;
  androidMakePlayServicesAvailable(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboUtils');
