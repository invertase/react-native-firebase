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

import { getApp } from '@react-native-firebase/app';
import {
  MODULAR_DEPRECATION_ARG,
  withModularFlag,
} from '@react-native-firebase/app/dist/module/common';
import type { InAppMessaging } from './types/in-app-messaging';
import type { InAppMessagingWithDeprecationArg } from './types/internal';

function withModularDeprecationArg(inAppMessaging: InAppMessaging): InAppMessagingWithDeprecationArg {
  return inAppMessaging as InAppMessagingWithDeprecationArg;
}

/**
 * Returns the {@link InAppMessaging} instance for the default app.
 */
export function getInAppMessaging(): InAppMessaging {
  return getApp().inAppMessaging();
}

/**
 * Determines whether messages are suppressed or not.
 */
export function isMessagesDisplaySuppressed(inAppMessaging: InAppMessaging): boolean {
  return withModularFlag(() => inAppMessaging.isMessagesDisplaySuppressed);
}

/**
 * Enable or disable suppression of Firebase In App Messaging messages.
 *
 * When enabled, no in app messages will be rendered until either you disable suppression, or the app
 * restarts. This state is not persisted between app restarts.
 */
export function setMessagesDisplaySuppressed(
  inAppMessaging: InAppMessaging,
  enabled: boolean,
): Promise<null> {
  const internalInAppMessaging = withModularDeprecationArg(inAppMessaging);
  return internalInAppMessaging.setMessagesDisplaySuppressed.call(
    internalInAppMessaging,
    enabled,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Determines whether automatic data collection is enabled or not.
 */
export function isAutomaticDataCollectionEnabled(inAppMessaging: InAppMessaging): boolean {
  return withModularFlag(() => inAppMessaging.isAutomaticDataCollectionEnabled);
}

/**
 * Enable or disable automatic data collection for Firebase In-App Messaging.
 *
 * When enabled, generates a registration token on app startup if there is no valid one and
 * generates a new token when it is deleted (which prevents `deleteInstanceId()` from stopping the
 * periodic sending of data).
 *
 * This setting is persisted across app restarts and overrides the setting specified in your
 * manifest/plist file.
 */
export function setAutomaticDataCollectionEnabled(
  inAppMessaging: InAppMessaging,
  enabled: boolean,
): Promise<null> {
  const internalInAppMessaging = withModularDeprecationArg(inAppMessaging);
  return internalInAppMessaging.setAutomaticDataCollectionEnabled.call(
    internalInAppMessaging,
    enabled,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Trigger in-app messages programmatically.
 */
export function triggerEvent(inAppMessaging: InAppMessaging, eventId: string): Promise<null> {
  const internalInAppMessaging = withModularDeprecationArg(inAppMessaging);
  return internalInAppMessaging.triggerEvent.call(
    internalInAppMessaging,
    eventId,
    MODULAR_DEPRECATION_ARG,
  );
}
