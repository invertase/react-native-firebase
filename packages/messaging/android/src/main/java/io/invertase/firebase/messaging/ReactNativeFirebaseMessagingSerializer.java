package io.invertase.firebase.messaging;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.common.ReactNativeFirebaseEvent;
import io.invertase.firebase.common.SharedUtils;

import java.util.Map;
import java.util.Set;

class ReactNativeFirebaseMessagingSerializer {
  private static final String KEY_TOKEN = "token";
  private static final String KEY_COLLAPSE_KEY = "collapseKey";
  private static final String KEY_DATA = "data";
  private static final String KEY_FROM = "from";
  private static final String KEY_MESSAGE_ID = "messageId";
  private static final String KEY_MESSAGE_TYPE = "messageType";
  private static final String KEY_SENT_TIME = "sentTime";
  private static final String KEY_ERROR = "error";
  private static final String KEY_TO = "to";
  private static final String KEY_TTL = "ttl";
  private static final String EVENT_MESSAGE_SENT = "messaging_message_sent";
  private static final String EVENT_MESSAGES_DELETED = "messaging_message_deleted";
  private static final String EVENT_MESSAGE_RECEIVED = "messaging_message_received";
  private static final String EVENT_MESSAGE_SEND_ERROR = "messaging_message_send_error";
  private static final String EVENT_NEW_TOKEN = "messaging_token_refresh";

  static ReactNativeFirebaseEvent messagesDeletedToEvent() {
    return new ReactNativeFirebaseEvent(EVENT_MESSAGES_DELETED, Arguments.createMap());
  }

  static ReactNativeFirebaseEvent messageSentToEvent(String messageId) {
    WritableMap eventBody = Arguments.createMap();
    eventBody.putString(KEY_MESSAGE_ID, messageId);
    return new ReactNativeFirebaseEvent(EVENT_MESSAGE_SENT, eventBody);
  }

  static ReactNativeFirebaseEvent messageSendErrorToEvent(String messageId, Exception sendError) {
    WritableMap eventBody = Arguments.createMap();
    eventBody.putString(KEY_MESSAGE_ID, messageId);
    eventBody.putMap(KEY_ERROR, SharedUtils.getExceptionMap(sendError));
    return new ReactNativeFirebaseEvent(EVENT_MESSAGE_SEND_ERROR, eventBody);
  }

  static ReactNativeFirebaseEvent remoteMessageToEvent(RemoteMessage remoteMessage) {
    return new ReactNativeFirebaseEvent(EVENT_MESSAGE_RECEIVED, remoteMessageToWritableMap(remoteMessage));
  }

  static ReactNativeFirebaseEvent newTokenToTokenEvent(String newToken) {
    WritableMap eventBody = Arguments.createMap();
    eventBody.putString(KEY_TOKEN, newToken);
    return new ReactNativeFirebaseEvent(EVENT_NEW_TOKEN, eventBody);
  }

  static WritableMap remoteMessageToWritableMap(RemoteMessage remoteMessage) {
    WritableMap messageMap = Arguments.createMap();
    WritableMap dataMap = Arguments.createMap();

    if (remoteMessage.getCollapseKey() != null) {
      messageMap.putString(KEY_COLLAPSE_KEY, remoteMessage.getCollapseKey());
    }

    if (remoteMessage.getFrom() != null) {
      messageMap.putString(KEY_FROM, remoteMessage.getFrom());
    }

    if (remoteMessage.getTo() != null) {
      messageMap.putString(KEY_TO, remoteMessage.getTo());
    }

    if (remoteMessage.getMessageId() != null) {
      messageMap.putString(KEY_MESSAGE_ID, remoteMessage.getMessageId());
    }

    if (remoteMessage.getMessageType() != null) {
      messageMap.putString(KEY_MESSAGE_TYPE, remoteMessage.getMessageType());
    }

    if (remoteMessage.getData().size() > 0) {
      Set<Map.Entry<String, String>> entries = remoteMessage.getData().entrySet();
      for (Map.Entry<String, String> entry : entries) {
        dataMap.putString(entry.getKey(), entry.getValue());
      }
    }

    messageMap.putMap(KEY_DATA, dataMap);
    messageMap.putDouble(KEY_TTL, remoteMessage.getTtl());
    messageMap.putDouble(KEY_SENT_TIME, remoteMessage.getSentTime());
    return messageMap;
  }

  static RemoteMessage remoteMessageFromReadableMap(ReadableMap readableMap) {
    RemoteMessage.Builder builder = new RemoteMessage.Builder(readableMap.getString(KEY_TO));

    if (readableMap.hasKey(KEY_TTL)) {
      builder.setTtl(readableMap.getInt(KEY_TTL));
    }

    if (readableMap.hasKey(KEY_MESSAGE_ID)) {
      builder.setMessageId(readableMap.getString(KEY_MESSAGE_ID));
    }

    if (readableMap.hasKey(KEY_MESSAGE_TYPE)) {
      builder.setMessageType(readableMap.getString(KEY_MESSAGE_TYPE));
    }

    if (readableMap.hasKey(KEY_COLLAPSE_KEY)) {
      builder.setCollapseKey(readableMap.getString(KEY_COLLAPSE_KEY));
    }

    if (readableMap.hasKey(KEY_DATA)) {
      ReadableMap messageData = readableMap.getMap(KEY_DATA);
      ReadableMapKeySetIterator iterator = messageData.keySetIterator();

      while (iterator.hasNextKey()) {
        String key = iterator.nextKey();
        builder.addData(key, messageData.getString(key));
      }
    }

    return builder.build();
  }

}
