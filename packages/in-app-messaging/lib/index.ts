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

import { isBoolean, isString } from '@react-native-firebase/app/dist/module/common';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import './types/internal';
import type { FirebaseApp } from '@react-native-firebase/app';
import type { InAppMessaging } from './types/in-app-messaging';
import fallBackModule from './web/RNFBFiamModule';
import { version } from './version';

const nativeModuleName = 'NativeRNFBTurboFiam';

class FirebaseFiamModule extends FirebaseModule<typeof nativeModuleName> {
  private _isMessagesDisplaySuppressed: boolean;
  private _isAutomaticDataCollectionEnabled: boolean;

  constructor(...args: ConstructorParameters<typeof FirebaseModule>) {
    super(...args);
    this._isMessagesDisplaySuppressed = this.native.isMessagesDisplaySuppressed;
    this._isAutomaticDataCollectionEnabled = this.native.isAutomaticDataCollectionEnabled;
  }

  get isMessagesDisplaySuppressed(): boolean {
    return this._isMessagesDisplaySuppressed;
  }

  get isAutomaticDataCollectionEnabled(): boolean {
    return this._isAutomaticDataCollectionEnabled;
  }

  setMessagesDisplaySuppressed(enabled: boolean): Promise<null> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "getInAppMessaging().setMessagesDisplaySuppressed(*) 'enabled' must be a boolean.",
      );
    }

    this._isMessagesDisplaySuppressed = enabled;
    return this.native.setMessagesDisplaySuppressed(enabled);
  }

  setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "getInAppMessaging().setAutomaticDataCollectionEnabled(*) 'enabled' must be a boolean.",
      );
    }

    this._isAutomaticDataCollectionEnabled = enabled;
    return this.native.setAutomaticDataCollectionEnabled(enabled);
  }

  triggerEvent(eventId: string): Promise<null> {
    if (!isString(eventId)) {
      throw new Error("getInAppMessaging().triggerEvent(*) 'eventId' must be a string.");
    }
    return this.native.triggerEvent(eventId);
  }
}

const config: ModuleConfig = {
  namespace: 'inAppMessaging',
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

/**
 * RN Firebase package version string exported from the modular entry point.
 *
 * The firebase-js-sdk does not ship a modular In-App Messaging entry point or `SDK_VERSION` export.
 */
export const SDK_VERSION = version;

/**
 * Returns the {@link InAppMessaging} instance for the default or given {@link FirebaseApp}.
 *
 * @param app - The Firebase `FirebaseApp` to use. When omitted, the default app is used.
 * @returns The In-App Messaging service instance for that app.
 */
export function getInAppMessaging(app?: FirebaseApp): InAppMessaging {
  return getOrCreateModularInstance(FirebaseFiamModule, config, app) as unknown as InAppMessaging;
}

/**
 * Determines whether messages are suppressed or not.
 */
export function isMessagesDisplaySuppressed(inAppMessaging: InAppMessaging): boolean {
  return inAppMessaging.isMessagesDisplaySuppressed;
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
  return inAppMessaging.setMessagesDisplaySuppressed(enabled);
}

/**
 * Determines whether automatic data collection is enabled or not.
 */
export function isAutomaticDataCollectionEnabled(inAppMessaging: InAppMessaging): boolean {
  return inAppMessaging.isAutomaticDataCollectionEnabled;
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
  return inAppMessaging.setAutomaticDataCollectionEnabled(enabled);
}

/**
 * Trigger in-app messages programmatically.
 */
export function triggerEvent(inAppMessaging: InAppMessaging, eventId: string): Promise<null> {
  return inAppMessaging.triggerEvent(eventId);
}

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule as unknown as Record<string, unknown>);

export type { InAppMessaging } from './types/in-app-messaging';
