package io.invertase.firebase.messaging;

import com.google.firebase.messaging.RemoteMessage;

import com.facebook.react.bridge.WritableMap;

public interface ReactNativeFirebaseMessagingStore {
  void storeFirebaseMessage(RemoteMessage remoteMessage);

  WritableMap getFirebaseMessage(String remoteMessageId);

  void clearFirebaseMessage(String remoteMessageId);
}
