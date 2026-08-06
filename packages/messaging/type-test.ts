import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  deleteToken,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  isAutoInitEnabled,
  setAutoInitEnabled,
  getInitialNotification,
  getDidOpenSettingsForNotification,
  getIsHeadless,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  unregisterDeviceForRemoteMessages,
  getAPNSToken,
  setAPNSToken,
  hasPermission,
  onDeletedMessages,
  onMessageSent,
  onSendError,
  setBackgroundMessageHandler,
  setOpenSettingsForNotificationsHandler,
  sendMessage,
  subscribeToTopic,
  unsubscribeFromTopic,
  isDeliveryMetricsExportToBigQueryEnabled,
  setNotificationDelegationEnabled,
  isSupported,
  experimentalSetDeliveryMetricsExportedToBigQueryEnabled,
  AuthorizationStatus,
  NotificationAndroidPriority,
  NotificationAndroidVisibility,
  SDK_VERSION,
  type Messaging,
  type RemoteMessage,
  type SendErrorEvent,
} from '.';
import type { AuthorizationStatus as MessagingAuthStatus } from './lib/types/messaging';

const modularMessaging1 = getMessaging();
console.log(modularMessaging1.app.name);

const modularMessaging2 = getMessaging(getApp());
console.log(modularMessaging2.app.name);

const typedMessaging: Messaging = modularMessaging1;
console.log(typedMessaging.app.name);

console.log(isAutoInitEnabled(modularMessaging1));

setAutoInitEnabled(modularMessaging1, false).then(() => {
  console.log('Modular auto init disabled');
});

getInitialNotification(modularMessaging1).then((message: RemoteMessage | null) => {
  if (message) {
    console.log(message.data);
  }
});

getDidOpenSettingsForNotification(modularMessaging1).then((opened: boolean) => {
  console.log(opened);
});

getIsHeadless(modularMessaging1).then((isHeadless: boolean) => {
  console.log(isHeadless);
});

getToken(modularMessaging1).then((token: string) => {
  console.log(token);
});

getToken(modularMessaging1, { appName: 'test', senderId: 'test-sender' }).then((token: string) => {
  console.log(token);
});

deleteToken(modularMessaging1).then(() => {
  console.log('Modular token deleted');
});

deleteToken(modularMessaging1, { appName: 'test', senderId: 'test-sender' }).then(() => {
  console.log('Modular token deleted with options');
});

const modularUnsubscribeOnMessage = onMessage(modularMessaging1, (message: RemoteMessage) => {
  console.log(message.data);
});
modularUnsubscribeOnMessage();

const modularUnsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(
  modularMessaging1,
  (message: RemoteMessage) => {
    console.log(message.data);
  },
);
modularUnsubscribeOnNotificationOpenedApp();

const modularUnsubscribeOnTokenRefresh = onTokenRefresh(modularMessaging1, (token: string) => {
  console.log(token);
});
modularUnsubscribeOnTokenRefresh();

requestPermission(modularMessaging1).then((status: MessagingAuthStatus) => {
  console.log(status);
});

requestPermission(modularMessaging1, {
  alert: true,
  badge: true,
  sound: true,
}).then((status: MessagingAuthStatus) => {
  console.log(status);
});

registerDeviceForRemoteMessages(modularMessaging1).then(() => {
  console.log('Modular device registered');
});

console.log(isDeviceRegisteredForRemoteMessages(modularMessaging1));

unregisterDeviceForRemoteMessages(modularMessaging1).then(() => {
  console.log('Modular device unregistered');
});

getAPNSToken(modularMessaging1).then((token: string | null) => {
  console.log(token);
});

setAPNSToken(modularMessaging1, 'modular-test-token', 'sandbox').then(() => {
  console.log('Modular APNS token set');
});

hasPermission(modularMessaging1).then((status: MessagingAuthStatus) => {
  console.log(status);
});

const modularUnsubscribeOnDeletedMessages = onDeletedMessages(modularMessaging1, () => {
  console.log('Modular messages deleted');
});
modularUnsubscribeOnDeletedMessages();

const modularUnsubscribeOnMessageSent = onMessageSent(modularMessaging1, (messageId: string) => {
  console.log(messageId);
});
modularUnsubscribeOnMessageSent();

const modularUnsubscribeOnSendError = onSendError(modularMessaging1, (evt: SendErrorEvent) => {
  console.log(evt.messageId);
  console.log(evt.error);
});
modularUnsubscribeOnSendError();

setBackgroundMessageHandler(modularMessaging1, async (message: RemoteMessage) => {
  console.log(message.data);
  return Promise.resolve();
});

setOpenSettingsForNotificationsHandler(modularMessaging1, (message: RemoteMessage) => {
  console.log(message.data);
});

sendMessage(modularMessaging1, {
  data: { modularKey: 'modularValue' },
  notification: {
    title: 'Modular Test',
    body: 'Modular Test body',
  },
  fcmOptions: {},
}).then(() => {
  console.log('Modular message sent');
});

subscribeToTopic(modularMessaging1, 'modular-test-topic').then(() => {
  console.log('Modular subscribed to topic');
});

unsubscribeFromTopic(modularMessaging1, 'modular-test-topic').then(() => {
  console.log('Modular unsubscribed from topic');
});

console.log(isDeliveryMetricsExportToBigQueryEnabled(modularMessaging1));

console.log(modularMessaging1.isNotificationDelegationEnabled);

setNotificationDelegationEnabled(modularMessaging1, true).then(() => {
  console.log('Modular notification delegation enabled');
});

isSupported(modularMessaging1).then((supported: boolean) => {
  console.log(supported);
});

experimentalSetDeliveryMetricsExportedToBigQueryEnabled(modularMessaging1, true).then(() => {
  console.log('Modular delivery metrics enabled');
});

console.log(AuthorizationStatus.AUTHORIZED);
console.log(NotificationAndroidPriority.PRIORITY_DEFAULT);
console.log(NotificationAndroidVisibility.VISIBILITY_PUBLIC);

const sdkVersion: string = SDK_VERSION;
console.log(sdkVersion);
