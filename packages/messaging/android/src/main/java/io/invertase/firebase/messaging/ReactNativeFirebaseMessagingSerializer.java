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

public class ReactNativeFirebaseMessagingSerializer {
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
  private static final String KEY_PRIORITY = "priority";
  private static final String KEY_ORIGINAL_PRIORITY = "originalPriority";
  private static final String EVENT_MESSAGE_SENT = "messaging_message_sent";
  private static final String EVENT_MESSAGES_DELETED = "messaging_message_deleted";
  private static final String EVENT_MESSAGE_RECEIVED = "messaging_message_received";
  private static final String EVENT_NOTIFICATION_OPENED = "messaging_notification_opened";
  private static final String EVENT_MESSAGE_SEND_ERROR = "messaging_message_send_error";
  private static final String EVENT_NEW_TOKEN = "messaging_token_refresh";

  public static ReactNativeFirebaseEvent messagesDeletedToEvent() {
    return new ReactNativeFirebaseEvent(EVENT_MESSAGES_DELETED, Arguments.createMap());
  }

  public static ReactNativeFirebaseEvent messageSentToEvent(String messageId) {
    WritableMap eventBody = Arguments.createMap();
    eventBody.putString(KEY_MESSAGE_ID, messageId);
    return new ReactNativeFirebaseEvent(EVENT_MESSAGE_SENT, eventBody);
  }

  public static ReactNativeFirebaseEvent messageSendErrorToEvent(
      String messageId, Exception sendError) {
    WritableMap eventBody = Arguments.createMap();
    eventBody.putString(KEY_MESSAGE_ID, messageId);
    eventBody.putMap(KEY_ERROR, SharedUtils.getExceptionMap(sendError));
    return new ReactNativeFirebaseEvent(EVENT_MESSAGE_SEND_ERROR, eventBody);
  }

  public static ReactNativeFirebaseEvent remoteMessageToEvent(
      RemoteMessage remoteMessage, Boolean openEvent) {
    return new ReactNativeFirebaseEvent(
        openEvent ? EVENT_NOTIFICATION_OPENED : EVENT_MESSAGE_RECEIVED,
        remoteMessageToWritableMap(remoteMessage));
  }

  public static ReactNativeFirebaseEvent remoteMessageMapToEvent(
      WritableMap remoteMessageMap, Boolean openEvent) {
    return new ReactNativeFirebaseEvent(
        openEvent ? EVENT_NOTIFICATION_OPENED : EVENT_MESSAGE_RECEIVED, remoteMessageMap);
  }

  public static ReactNativeFirebaseEvent newTokenToTokenEvent(String newToken) {
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
    messageMap.putInt(KEY_PRIORITY, remoteMessage.getPriority());
    messageMap.putInt(KEY_ORIGINAL_PRIORITY, remoteMessage.getOriginalPriority());

    if (remoteMessage.getNotification() != null) {
      messageMap.putMap(
          "notification", remoteMessageNotificationToWritableMap(remoteMessage.getNotification()));
    }

    return messageMap;
  }

  static WritableMap remoteMessageNotificationToWritableMap(
      RemoteMessage.Notification notification) {
    WritableMap notificationMap = Arguments.createMap();
    WritableMap androidNotificationMap = Arguments.createMap();

    if (notification.getTitle() != null) {
      notificationMap.putString("title", notification.getTitle());
    }

    if (notification.getTitleLocalizationKey() != null) {
      notificationMap.putString("titleLocKey", notification.getTitleLocalizationKey());
    }

    if (notification.getTitleLocalizationArgs() != null) {
      notificationMap.putArray(
          "titleLocArgs", Arguments.fromJavaArgs(notification.getTitleLocalizationArgs()));
    }

    if (notification.getBody() != null) {
      notificationMap.putString("body", notification.getBody());
    }

    if (notification.getBodyLocalizationKey() != null) {
      notificationMap.putString("bodyLocKey", notification.getBodyLocalizationKey());
    }

    if (notification.getBodyLocalizationArgs() != null) {
      notificationMap.putArray(
          "bodyLocArgs", Arguments.fromJavaArgs(notification.getBodyLocalizationArgs()));
    }

    if (notification.getChannelId() != null) {
      androidNotificationMap.putString("channelId", notification.getChannelId());
    }

    if (notification.getClickAction() != null) {
      androidNotificationMap.putString("clickAction", notification.getClickAction());
    }

    if (notification.getColor() != null) {
      androidNotificationMap.putString("color", notification.getColor());
    }

    if (notification.getIcon() != null) {
      androidNotificationMap.putString("smallIcon", notification.getIcon());
    }

    if (notification.getImageUrl() != null) {
      androidNotificationMap.putString("imageUrl", notification.getImageUrl().toString());
    }

    if (notification.getLink() != null) {
      androidNotificationMap.putString("link", notification.getLink().toString());
    }

    if (notification.getNotificationCount() != null) {
      androidNotificationMap.putInt("count", notification.getNotificationCount());
    }

    if (notification.getNotificationPriority() != null) {
      androidNotificationMap.putInt("priority", notification.getNotificationPriority());
    }

    if (notification.getSound() != null) {
      androidNotificationMap.putString("sound", notification.getSound());
    }

    if (notification.getTicker() != null) {
      androidNotificationMap.putString("ticker", notification.getTicker());
    }

    if (notification.getVisibility() != null) {
      androidNotificationMap.putInt("visibility", notification.getVisibility());
    }

    notificationMap.putMap("android", androidNotificationMap);
    return notificationMap;
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
