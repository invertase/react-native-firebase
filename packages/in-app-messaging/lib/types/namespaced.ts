/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase In-App Messaging package for React Native.
 *
 * @firebase in-app-messaging
 */

type FirebaseModule = ReactNativeFirebase.FirebaseModule;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseInAppMessagingTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseInAppMessagingTypes {
  /**
   * @deprecated Use the exported types directly instead. FirebaseInAppMessagingTypes namespace is kept for backwards compatibility.
   */
  export interface Statics {
    SDK_VERSION: string;
  }

  /**
   * The Firebase In-App Messaging service is available for the default app only.
   *
   * @deprecated Use the modular API (getInAppMessaging, setMessagesDisplaySuppressed, etc.) and types from '@react-native-firebase/in-app-messaging' instead.
   * FirebaseInAppMessagingTypes namespace is kept for backwards compatibility.
   */
  export interface Module extends FirebaseModule {
    /**
     * @deprecated Use the modular API instead.
     */
    app: ReactNativeFirebase.FirebaseApp;

    /**
     * @deprecated Use the modular `isMessagesDisplaySuppressed(inAppMessaging)` instead.
     */
    readonly isMessagesDisplaySuppressed: boolean;

    /**
     * @deprecated Use the modular `setMessagesDisplaySuppressed(inAppMessaging, enabled)` instead.
     */
    setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;

    /**
     * @deprecated Use the modular `isAutomaticDataCollectionEnabled(inAppMessaging)` instead.
     */
    readonly isAutomaticDataCollectionEnabled: boolean;

    /**
     * @deprecated Use the modular `setAutomaticDataCollectionEnabled(inAppMessaging, enabled)` instead.
     */
    setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;

    /**
     * @deprecated Use the modular `triggerEvent(inAppMessaging, eventId)` instead.
     */
    triggerEvent(eventId: string): Promise<null>;
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      inAppMessaging: FirebaseModuleWithStaticsAndApp<
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
