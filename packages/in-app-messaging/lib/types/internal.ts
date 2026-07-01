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
 * Wrapped native module contract for `RNFBFiamModule`.
 */
export interface RNFBFiamModule {
  isMessagesDisplaySuppressed: boolean;
  isAutomaticDataCollectionEnabled: boolean;
  setMessagesDisplaySuppressed(enabled: boolean): Promise<null>;
  setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null>;
  triggerEvent(eventId: string): Promise<null>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    NativeRNFBTurboFiam: RNFBFiamModule;
  }
}

export interface InAppMessagingInternal extends InAppMessaging {
  readonly native: RNFBFiamModule;
}
