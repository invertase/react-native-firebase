import messaging, {
  firebase,
  FirebaseMessagingTypes,
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
} from '.';

console.log(messaging().app);

// checks module exists at root
console.log(firebase.messaging().app.name);
console.log(firebase.messaging().isAutoInitEnabled);
console.log(firebase.messaging().isDeviceRegisteredForRemoteMessages);
console.log(firebase.messaging().isNotificationDelegationEnabled);
console.log(firebase.messaging().isDeliveryMetricsExportToBigQueryEnabled);

// checks module exists at app level
console.log(firebase.app().messaging().app.name);
console.log(firebase.app().messaging().isAutoInitEnabled);

// checks statics exist
console.log(firebase.messaging.SDK_VERSION);
console.log(firebase.messaging.AuthorizationStatus.AUTHORIZED);
console.log(firebase.messaging.AuthorizationStatus.DENIED);
console.log(firebase.messaging.AuthorizationStatus.NOT_DETERMINED);
console.log(firebase.messaging.AuthorizationStatus.PROVISIONAL);
console.log(firebase.messaging.NotificationAndroidPriority.PRIORITY_LOW);
console.log(firebase.messaging.NotificationAndroidPriority.PRIORITY_HIGH);
console.log(firebase.messaging.NotificationAndroidVisibility.VISIBILITY_PRIVATE);
console.log(firebase.messaging.NotificationAndroidVisibility.VISIBILITY_PUBLIC);

// checks statics exist on defaultExport
console.log(messaging.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks default export supports app arg
console.log(messaging().app.name);

// checks Module instance APIs
const messagingInstance = firebase.messaging();
console.log(messagingInstance.app.name);
console.log(messagingInstance.isAutoInitEnabled);
console.log(messagingInstance.isDeviceRegisteredForRemoteMessages);
console.log(messagingInstance.isNotificationDelegationEnabled);
console.log(messagingInstance.isDeliveryMetricsExportToBigQueryEnabled);

messagingInstance.setAutoInitEnabled(false).then(() => {
  console.log('Auto init disabled');
});

messagingInstance
  .getInitialNotification()
  .then((message: FirebaseMessagingTypes.RemoteMessage | null) => {
    if (message) {
      console.log(message.data);
    }
  });

messagingInstance.getDidOpenSettingsForNotification().then((opened: boolean) => {
  console.log(opened);
});

messagingInstance.getIsHeadless().then((isHeadless: boolean) => {
  console.log(isHeadless);
});

messagingInstance.getToken().then((token: string) => {
  console.log(token);
});

messagingInstance.getToken({ appName: 'test', senderId: 'test-sender' }).then((token: string) => {
  console.log(token);
});

messagingInstance.deleteToken().then(() => {
  console.log('Token deleted');
});

messagingInstance.deleteToken({ appName: 'test', senderId: 'test-sender' }).then(() => {
  console.log('Token deleted with options');
});

const unsubscribeOnMessage = messagingInstance.onMessage(
  (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log(message.data);
  },
);
unsubscribeOnMessage();

const unsubscribeOnNotificationOpenedApp = messagingInstance.onNotificationOpenedApp(
  (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log(message.data);
  },
);
unsubscribeOnNotificationOpenedApp();

const unsubscribeOnTokenRefresh = messagingInstance.onTokenRefresh((token: string) => {
  console.log(token);
});
unsubscribeOnTokenRefresh();

messagingInstance.requestPermission().then((status: FirebaseMessagingTypes.AuthorizationStatus) => {
  console.log(status);
});

messagingInstance
  .requestPermission({
    alert: true,
    badge: true,
    sound: true,
  })
  .then((status: FirebaseMessagingTypes.AuthorizationStatus) => {
    console.log(status);
  });

messagingInstance.registerDeviceForRemoteMessages().then(() => {
  console.log('Device registered');
});

messagingInstance.unregisterDeviceForRemoteMessages().then(() => {
  console.log('Device unregistered');
});

messagingInstance.getAPNSToken().then((token: string | null) => {
  console.log(token);
});

messagingInstance.setAPNSToken('test-token', 'prod').then(() => {
  console.log('APNS token set');
});

messagingInstance.hasPermission().then((status: FirebaseMessagingTypes.AuthorizationStatus) => {
  console.log(status);
});

const unsubscribeOnDeletedMessages = messagingInstance.onDeletedMessages(() => {
  console.log('Messages deleted');
});
unsubscribeOnDeletedMessages();

const unsubscribeOnMessageSent = messagingInstance.onMessageSent((messageId: string) => {
  console.log(messageId);
});
unsubscribeOnMessageSent();

const unsubscribeOnSendError = messagingInstance.onSendError(
  (evt: FirebaseMessagingTypes.SendErrorEvent) => {
    console.log(evt.messageId);
    console.log(evt.error);
  },
);
unsubscribeOnSendError();

messagingInstance.setBackgroundMessageHandler(
  async (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log(message.data);
    return Promise.resolve();
  },
);

messagingInstance.setOpenSettingsForNotificationsHandler(
  (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log(message.data);
  },
);

messagingInstance
  .sendMessage({
    data: { key: 'value' },
    notification: {
      title: 'Test',
      body: 'Test body',
    },
    fcmOptions: {},
  })
  .then(() => {
    console.log('Message sent');
  });

messagingInstance.subscribeToTopic('test-topic').then(() => {
  console.log('Subscribed to topic');
});

messagingInstance.unsubscribeFromTopic('test-topic').then(() => {
  console.log('Unsubscribed from topic');
});

messagingInstance.setDeliveryMetricsExportToBigQuery(true).then(() => {
  console.log('Delivery metrics enabled');
});

messagingInstance.setNotificationDelegationEnabled(true).then(() => {
  console.log('Notification delegation enabled');
});

messagingInstance.istNotificationDelegationEnabled().then((enabled: boolean) => {
  console.log(enabled);
});

messagingInstance.isSupported().then((supported: boolean) => {
  console.log(supported);
});

// checks modular API functions
const modularMessaging1 = getMessaging();
console.log(modularMessaging1.app.name);

const modularMessaging2 = getMessaging(firebase.app());
console.log(modularMessaging2.app.name);

console.log(isAutoInitEnabled(modularMessaging1));

setAutoInitEnabled(modularMessaging1, false).then(() => {
  console.log('Modular auto init disabled');
});

getInitialNotification(modularMessaging1).then(
  (message: FirebaseMessagingTypes.RemoteMessage | null) => {
    if (message) {
      console.log(message.data);
    }
  },
);

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

const modularUnsubscribeOnMessage = onMessage(
  modularMessaging1,
  (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log(message.data);
  },
);
modularUnsubscribeOnMessage();

const modularUnsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(
  modularMessaging1,
  (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log(message.data);
  },
);
modularUnsubscribeOnNotificationOpenedApp();

const modularUnsubscribeOnTokenRefresh = onTokenRefresh(modularMessaging1, (token: string) => {
  console.log(token);
});
modularUnsubscribeOnTokenRefresh();

requestPermission(modularMessaging1).then((status: FirebaseMessagingTypes.AuthorizationStatus) => {
  console.log(status);
});

requestPermission(modularMessaging1, {
  alert: true,
  badge: true,
  sound: true,
}).then((status: FirebaseMessagingTypes.AuthorizationStatus) => {
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

hasPermission(modularMessaging1).then((status: FirebaseMessagingTypes.AuthorizationStatus) => {
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

const modularUnsubscribeOnSendError = onSendError(
  modularMessaging1,
  (evt: FirebaseMessagingTypes.SendErrorEvent) => {
    console.log(evt.messageId);
    console.log(evt.error);
  },
);
modularUnsubscribeOnSendError();

setBackgroundMessageHandler(
  modularMessaging1,
  async (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log(message.data);
    return Promise.resolve();
  },
);

setOpenSettingsForNotificationsHandler(
  modularMessaging1,
  (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log(message.data);
  },
);

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

console.log(isSupported(modularMessaging1));

experimentalSetDeliveryMetricsExportedToBigQueryEnabled(modularMessaging1, true).then(() => {
  console.log('Modular delivery metrics enabled');
});

// checks modular statics exports
console.log(AuthorizationStatus.AUTHORIZED);
console.log(NotificationAndroidPriority.PRIORITY_DEFAULT);
console.log(NotificationAndroidVisibility.VISIBILITY_PUBLIC);
