package io.invertase.firebase.messaging;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;

public class ReactNativeFirebaseMessagingService extends FirebaseMessagingService {
  @Override
  public void onSendError(String messageId, Exception sendError) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(
        ReactNativeFirebaseMessagingSerializer.messageSendErrorToEvent(messageId, sendError));
  }

  @Override
  public void onDeletedMessages() {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.messagesDeletedToEvent());
  }

  @Override
  public void onMessageSent(String messageId) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.messageSentToEvent(messageId));
  }

  @Override
  public void onNewToken(String token) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.newTokenToTokenEvent(token));
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    // noop - handled in receiver
  }
}
