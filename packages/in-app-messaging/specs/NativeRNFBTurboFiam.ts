import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getConstants(): {
    isMessagesDisplaySuppressed: boolean;
    isAutomaticDataCollectionEnabled: boolean;
  };

  setAutomaticDataCollectionEnabled(enabled: boolean): Promise<void>;
  setMessagesDisplaySuppressed(enabled: boolean): Promise<void>;
  triggerEvent(eventId: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboFiam');
