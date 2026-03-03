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

import type { InAppMessaging } from './in-app-messaging';

/**
 * Wraps a method type so it accepts MODULAR_DEPRECATION_ARG as a trailing argument.
 * Allows modular wrappers to use .call(instance, ...args, MODULAR_DEPRECATION_ARG) without changing internal types.
 */
export type WithModularDeprecationArg<T extends (...args: any[]) => any> = T extends (
  ...args: infer A
) => infer R
  ? (...args: [...A, unknown?]) => R
  : never;

/**
 * Wrapped native module interface for In-App Messaging.
 */
export interface RNFBFiamModule {
  readonly isMessagesDisplaySuppressed: boolean;
  readonly isAutomaticDataCollectionEnabled: boolean;
  setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;
  setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;
  triggerEvent(eventId: string): Promise<null>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBFiamModule: RNFBFiamModule;
  }
}

/**
 * Internal InAppMessaging type with access to instance methods and properties.
 * Used by namespaced implementation and modular wrappers; not part of the public modular API.
 */
export type InAppMessagingInternal = InAppMessaging & {
  readonly isMessagesDisplaySuppressed: boolean;
  readonly isAutomaticDataCollectionEnabled: boolean;
  setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;
  setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;
  triggerEvent(eventId: string): Promise<null>;
};
