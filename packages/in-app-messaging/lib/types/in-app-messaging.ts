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

import type { FirebaseApp } from '@react-native-firebase/app';

/**
 * Firebase In-App Messaging service instance for the modular API.
 *
 * Current Firebase JS SDK releases do not ship a `firebase/in-app-messaging` modular entry point;
 * this interface follows the same modular service-instance pattern used elsewhere in React Native
 * Firebase.
 */
export interface InAppMessaging {
  /** The FirebaseApp this module is associated with. */
  app: FirebaseApp;

  /** Whether Firebase In-App Messaging message rendering is currently suppressed. */
  isMessagesDisplaySuppressed: boolean;

  /** Whether automatic data collection is enabled for Firebase In-App Messaging. */
  isAutomaticDataCollectionEnabled: boolean;

  /**
   * Enable or disable suppression of Firebase In-App Messaging messages.
   *
   * When enabled, no in-app messages will be rendered until either suppression is disabled or the
   * app restarts. This state is not persisted between app restarts.
   */
  setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;

  /**
   * Enable or disable automatic data collection for Firebase In-App Messaging.
   *
   * When enabled, generates a registration token on app startup if there is no valid one and
   * generates a new token when it is deleted.
   */
  setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;

  /** Trigger in-app messages programmatically for the given event id. */
  triggerEvent(eventId: string): Promise<null>;
}
