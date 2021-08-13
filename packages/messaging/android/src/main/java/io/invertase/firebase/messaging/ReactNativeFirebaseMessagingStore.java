package io.invertase.firebase.messaging;

import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;

public interface ReactNativeFirebaseMessagingStore {
  void storeFirebaseMessage(RemoteMessage remoteMessage);

  @Deprecated
  RemoteMessage getFirebaseMessage(String remoteMessageId);

  WritableMap getFirebaseMessageMap(String remoteMessageId);

  void clearFirebaseMessage(String remoteMessageId);
}
