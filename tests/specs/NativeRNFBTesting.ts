import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Test-app-only TurboModule for native integration probes (e2e regressions).
 * Platform-specific methods no-op on unsupported platforms at the native layer.
 */
export interface Spec extends TurboModule {
  /** iOS: FIRMessaging delegate installed by AppDelegate probe forwards token refresh. */
  messagingPreservesExistingDelegate(): Promise<boolean>;
  /** iOS: RNFBMessagingAppDelegate completes fetch handler for non-FCM remote notifications. */
  completesNonFCMRemoteNotification(): Promise<boolean>;
  /** Android: messaging store clears / skips persistence when max stored notifications is <= 0. */
  messagingStoreSupportsDisabledStorage(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('NativeRNFBTesting');
