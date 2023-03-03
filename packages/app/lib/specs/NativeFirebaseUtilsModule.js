// @flow
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  +getConstants: () => {|
    isRunningInTestLab: boolean,
    androidPlayServices: Object,
    MAIN_BUNDLE: string,
    DOCUMENT_DIRECTORY: string,
    LIBRARY_DIRECTORY: string,
    EXTERNAL_DIRECTORY: string,
    EXTERNAL_STORAGE_DIRECTORY: string,
    PICTURES_DIRECTORY: string,
    MOVIES_DIRECTORY: string,
    TEMP_DIRECTORY: string,
    CACHES_DIRECTORY: string,
  |};

  +androidGetPlayServicesStatus: () => Promise<Object>;
  +androidPromptForPlayServices: () => void;
  +androidResolutionForPlayServices: () => void;
  +androidMakePlayServicesAvailable: () => void;
}
  
export default (TurboModuleRegistry.get<Spec>('RNFBUtilsModule'): ?Spec);
