package io.invertase.firebase.messaging;

import com.google.firebase.messaging.RemoteMessage;

public interface ReactNativeFirebaseMessagingStore {
  void storeFirebaseMessage(RemoteMessage remoteMessage);

  RemoteMessage getFirebaseMessage(String remoteMessageId);

  void clearFirebaseMessage(String remoteMessageId);
}
