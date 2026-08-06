/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface IOSPermissions {
  alert?: boolean;
  announcement?: boolean;
  badge?: boolean;
  carPlay?: boolean;
  criticalAlert?: boolean;
  provisional?: boolean;
  sound?: boolean;
  providesAppNotificationSettings?: boolean;
}

export interface Spec extends TurboModule {
  getConstants(): {
    isAutoInitEnabled: boolean;
    isDeliveryMetricsExportToBigQueryEnabled: boolean;
    isRegisteredForRemoteNotifications?: boolean;
    isNotificationDelegationEnabled?: boolean;
  };

  getInitialNotification(): Promise<Object | null>;
  getDidOpenSettingsForNotification(): Promise<boolean>;
  setAutoInitEnabled(enabled: boolean): Promise<void>;
  signalBackgroundMessageHandlerSet(): void;
  completeNotificationProcessing(): void;
  getToken(appName: string, senderId: string): Promise<string>;
  deleteToken(appName: string, senderId: string): Promise<void>;
  getAPNSToken(): Promise<string | null>;
  setAPNSToken(token: string, type?: string): Promise<void>;
  getIsHeadless(): Promise<boolean>;
  requestPermission(permissions: IOSPermissions): Promise<number>;
  registerForRemoteNotifications(): Promise<void>;
  unregisterForRemoteNotifications(): Promise<void>;
  hasPermission(): Promise<number>;
  sendMessage(remoteMessageMap: Object): Promise<void>;
  subscribeToTopic(topic: string): Promise<void>;
  unsubscribeFromTopic(topic: string): Promise<void>;
  setDeliveryMetricsExportToBigQuery(enabled: boolean): Promise<void>;
  setNotificationDelegationEnabled(enabled: boolean): Promise<void>;
  isNotificationDelegationEnabled(): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboMessaging');
