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

import type { IOSPermissions, RemoteMessage } from './messaging';

/**
 * Wrapped native module contract for `NativeRNFBTurboMessaging`.
 */
export interface NativeRNFBTurboMessaging {
  getConstants?(): {
    isAutoInitEnabled?: boolean;
    isDeliveryMetricsExportToBigQueryEnabled?: boolean;
    isRegisteredForRemoteNotifications?: boolean;
    isNotificationDelegationEnabled?: boolean;
  };
  isAutoInitEnabled?: boolean;
  isDeliveryMetricsExportToBigQueryEnabled?: boolean;
  isRegisteredForRemoteNotifications?: boolean;
  setAutoInitEnabled(enabled: boolean): Promise<void>;
  getInitialNotification(): Promise<RemoteMessage | null>;
  getDidOpenSettingsForNotification(): Promise<boolean>;
  getIsHeadless(): Promise<boolean>;
  getToken(appName: string, senderId: string): Promise<string>;
  deleteToken(appName: string, senderId: string): Promise<void>;
  requestPermission(permissions: IOSPermissions): Promise<number>;
  registerForRemoteNotifications(): Promise<void>;
  unregisterForRemoteNotifications(): Promise<void>;
  getAPNSToken(): Promise<string | null>;
  setAPNSToken(token: string, type?: string): Promise<void>;
  hasPermission(): Promise<number>;
  completeNotificationProcessing(): void;
  signalBackgroundMessageHandlerSet(): void;
  sendMessage(options: Record<string, unknown>): Promise<void>;
  subscribeToTopic(topic: string): Promise<void>;
  unsubscribeFromTopic(topic: string): Promise<void>;
  setDeliveryMetricsExportToBigQuery(enabled: boolean): Promise<void>;
  isNotificationDelegationEnabled(): Promise<boolean>;
  setNotificationDelegationEnabled(enabled: boolean): Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    NativeRNFBTurboMessaging: NativeRNFBTurboMessaging;
  }
}
