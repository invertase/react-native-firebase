import type { ReactNativeFirebase } from '@react-native-firebase/app';

// ============ Statics Interface ============

export interface Statics {
  SDK_VERSION: string;
}

// ============ Module Interface ============

/**
 * The Firebase In-App Messaging service interface.
 *
 * > This module is available for the default app only.
 *
 * #### Example
 *
 * Get the In-App Messaging service for the default app:
 *
 * ```js
 * const defaultAppInAppMessaging = firebase.inAppMessaging();
 * ```
 */
export interface InAppMessaging extends ReactNativeFirebase.FirebaseModule {
  /**
   * The current `FirebaseApp` instance for this Firebase service.
   */
  app: ReactNativeFirebase.FirebaseApp;

  /**
   * Determines whether messages are suppressed or not.
   *
   * #### Example
   *
   * ```js
   * const isSuppressed = firebase.inAppMessaging().isMessagesDisplaySuppressed;
   * ```
   */
  isMessagesDisplaySuppressed: boolean;

  /**
   * Enable or disable suppression of Firebase In App Messaging messages.
   *
   * When enabled, no in app messages will be rendered until either you disable suppression, or the app restarts.
   * This state is not persisted between app restarts.
   *
   * #### Example
   *
   * ```js
   * // Suppress messages
   * await firebase.inAppMessaging().setMessagesDisplaySuppressed(true);
   * ```
   *
   * @param enabled Whether messages should be suppressed.
   */
  setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;

  /**
   * Determines whether automatic data collection is enabled or not.
   *
   * #### Example
   *
   * ```js
   * const isDataCollectionEnabled = firebase.inAppMessaging().isAutomaticDataCollectionEnabled;
   * ```
   */
  isAutomaticDataCollectionEnabled: boolean;

  /**
   * Enable or disable automatic data collection for Firebase In-App Messaging.
   *
   * When enabled, generates a registration token on app startup if there is no valid one and generates a new token
   * when it is deleted (which prevents `deleteInstanceId()` from stopping the periodic sending of data).
   *
   * This setting is persisted across app restarts and overrides the setting specified in your manifest/plist file.
   *
   * #### Example
   *
   * ```js
   * // Disable data collection
   * firebase.inAppMessaging().setAutomaticDataCollectionEnabled(false);
   * ```
   *
   * @param enabled Whether automatic data collection is enabled.
   */
  setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;

  /**
   * Trigger in-app messages programmatically
   *
   * #### Example
   *
   * ```js
   * // Suppress messages
   * await firebase.inAppMessaging().triggerEvent("exampleTrigger");
   * ```
   *
   * @param eventId The id of the event.
   */
  triggerEvent(eventId: string): Promise<null>;
}

// Helper types to reference outer scope types within the namespace
// These are needed because TypeScript can't directly alias types with the same name
type _Statics = Statics;
type _InAppMessaging = InAppMessaging;

/**
 * Firebase In-App Messaging package types for React Native.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseInAppMessagingTypes {
  // Type aliases referencing top-level types
  export type Statics = _Statics;
  export type InAppMessaging = _InAppMessaging;
  export type Module = InAppMessaging;
}
/* eslint-enable @typescript-eslint/no-namespace */

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;
    interface Module {
      inAppMessaging: FirebaseModuleWithStatics<
        FirebaseInAppMessagingTypes.Module,
        FirebaseInAppMessagingTypes.Statics
      >;
    }
    interface FirebaseApp {
      inAppMessaging(): FirebaseInAppMessagingTypes.Module;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
