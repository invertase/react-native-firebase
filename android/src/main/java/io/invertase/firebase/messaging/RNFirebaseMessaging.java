package io.invertase.firebase.messaging;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;
import com.google.firebase.messaging.RemoteMessage.Notification;

import io.invertase.firebase.Utils;
import me.leolin.shortcutbadger.ShortcutBadger;

import java.util.Map;

public class RNFirebaseMessaging extends ReactContextBaseJavaModule implements ActivityEventListener {
  private static final String BADGE_FILE = "BadgeCountFile";
  private static final String BADGE_KEY = "BadgeCount";

  private static final String TAG = RNFirebaseMessaging.class.getCanonicalName();

  private SharedPreferences sharedPreferences = null;

  public RNFirebaseMessaging(ReactApplicationContext context) {
    super(context);
    context.addActivityEventListener(this);

    sharedPreferences = context.getSharedPreferences(BADGE_FILE, Context.MODE_PRIVATE);

    LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(context);

    // Subscribe to message events
    localBroadcastManager.registerReceiver(new MessageReceiver(),
      new IntentFilter(RNFirebaseMessagingService.MESSAGE_EVENT));

    // Subscribe to token refresh events
    localBroadcastManager.registerReceiver(new RefreshTokenReceiver(),
      new IntentFilter(RNFirebaseInstanceIdService.TOKEN_REFRESH_EVENT));
  }

  @Override
  public String getName() {
    return "RNFirebaseMessaging";
  }

  @ReactMethod
  public void getToken(Promise promise) {
    String token = FirebaseInstanceId.getInstance().getToken();
    Log.d(TAG, "Firebase token: " + token);
    promise.resolve(token);
  }

  @ReactMethod
  public void requestPermission(Promise promise) {
    // TODO: Object structure?
    promise.resolve(null);
  }

  // Non Web SDK methods

  @ReactMethod
  public void getBadge(Promise promise) {
    int badge = sharedPreferences.getInt(BADGE_KEY, 0);
    Log.d(TAG, "Got badge count: " + badge);
    promise.resolve(badge);
  }

  @ReactMethod
  public void getInitialMessage(Promise promise) {
    if (getCurrentActivity() == null) {
      promise.resolve(null);
    } else {
      WritableMap messageMap = parseIntentForMessage(getCurrentActivity().getIntent());
      promise.resolve(messageMap);
    }
  }

  @ReactMethod
  public void sendMessage(ReadableMap messageMap, Promise promise) {
    if (!messageMap.hasKey("to")) {
      promise.reject("messaging/invalid-message", "The supplied message is missing a 'to' field");
      return;
    }

    RemoteMessage.Builder mb = new RemoteMessage.Builder(messageMap.getString("to"));

    if (messageMap.hasKey("collapseKey")) {
      mb = mb.setCollapseKey(messageMap.getString("collapseKey"));
    }
    if (messageMap.hasKey("messageId")) {
      mb = mb.setMessageId(messageMap.getString("messageId"));
    }
    if (messageMap.hasKey("messageType")) {
      mb = mb.setMessageType(messageMap.getString("messageType"));
    }
    if (messageMap.hasKey("ttl")) {
      mb = mb.setTtl(messageMap.getInt("ttl"));
    }
    if (messageMap.hasKey("data")) {
      ReadableMap dataMap = messageMap.getMap("data");
      ReadableMapKeySetIterator iterator = dataMap.keySetIterator();
      while (iterator.hasNextKey()) {
        String key = iterator.nextKey();
        mb = mb.addData(key, dataMap.getString(key));
      }
    }

    FirebaseMessaging.getInstance().send(mb.build());

    // TODO: Listen to onMessageSent and onSendError for better feedback?
    promise.resolve(null);
  }

  @ReactMethod
  public void setBadge(int badge) {
    // Store the badge count for later retrieval
    sharedPreferences.edit().putInt(BADGE_KEY, badge).apply();
    if (badge == 0) {
      Log.d(TAG, "Remove badge count");
      ShortcutBadger.removeCount(this.getReactApplicationContext());
    } else {
      Log.d(TAG, "Apply badge count: " + badge);
      ShortcutBadger.applyCount(this.getReactApplicationContext(), badge);
    }
  }

  @ReactMethod
  public void subscribeToTopic(String topic) {
    FirebaseMessaging.getInstance().subscribeToTopic(topic);
  }

  @ReactMethod
  public void unsubscribeFromTopic(String topic) {
    FirebaseMessaging.getInstance().unsubscribeFromTopic(topic);
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    // FCM functionality does not need this function
  }

  @Override
  public void onNewIntent(Intent intent) {
    WritableMap messageMap = parseIntentForMessage(intent);
    if (messageMap != null) {
      Log.d(TAG, "onNewIntent called with new FCM message");
      Utils.sendEvent(getReactApplicationContext(), "messaging_message_received", messageMap);
    }
  }

  private WritableMap parseIntentForMessage(Intent intent) {
    // Check if FCM data exists
    if (intent.getExtras() == null || !intent.hasExtra("google.message_id")) {
      return null;
    }

    Bundle extras = intent.getExtras();

    WritableMap messageMap = Arguments.createMap();
    WritableMap dataMap = Arguments.createMap();

    for (String key : extras.keySet()) {
      if (key.equals("collapse_key")) {
        messageMap.putString("collapseKey", extras.getString("collapse_key"));
      } else if (key.equals("from")) {
        messageMap.putString("from", extras.getString("from"));
      } else if (key.equals("google.message_id")) {
        messageMap.putString("messageId", extras.getString("google.message_id"));
      } else if (key.equals("google.sent_time")) {
        messageMap.putDouble("sentTime", extras.getLong("google.sent_time"));
      } else {
        dataMap.putString(key, extras.getString(key));
      }
    }
    messageMap.putMap("data", dataMap);
    messageMap.putBoolean("openedFromTray", true);

    return messageMap;
  }

  private class MessageReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      if (getReactApplicationContext().hasActiveCatalystInstance()) {
        Log.d(TAG, "Received new message");

        RemoteMessage message = intent.getParcelableExtra("message");
        WritableMap messageMap = buildMessageMap(message);

        Utils.sendEvent(getReactApplicationContext(), "messaging_message_received", messageMap);
      }
    }

    private WritableMap buildMessageMap(RemoteMessage message) {
      WritableMap messageMap = Arguments.createMap();
      WritableMap dataMap = Arguments.createMap();

      if (message.getCollapseKey() != null) {
        messageMap.putString("collapseKey", message.getCollapseKey());
      }

      if (message.getData() != null) {
        for (Map.Entry<String, String> e : message.getData().entrySet()) {
          dataMap.putString(e.getKey(), e.getValue());
        }
      }
      messageMap.putMap("data", dataMap);

      if (message.getFrom() != null) {
        messageMap.putString("from", message.getFrom());
      }
      if (message.getMessageId() != null) {
        messageMap.putString("messageId", message.getMessageId());
      }
      if (message.getMessageType() != null) {
        messageMap.putString("messageType", message.getMessageType());
      }

      if (message.getNotification() != null) {
        Notification notification = message.getNotification();

        WritableMap notificationMap = Arguments.createMap();

        if (notification.getBody() != null) {
          notificationMap.putString("body", notification.getBody());
        }
        if (notification.getBodyLocalizationArgs() != null) {
          WritableArray bodyArgs = Arguments.createArray();
          for (String arg : notification.getBodyLocalizationArgs()) {
            bodyArgs.pushString(arg);
          }
          notificationMap.putArray("bodyLocalizationArgs", bodyArgs);
        }
        if (notification.getBodyLocalizationKey() != null) {
          notificationMap.putString("bodyLocalizationKey", notification.getBodyLocalizationKey());
        }
        if (notification.getClickAction() != null) {
          notificationMap.putString("clickAction", notification.getClickAction());
        }
        if (notification.getColor() != null) {
          notificationMap.putString("color", notification.getColor());
        }
        if (notification.getIcon() != null) {
          notificationMap.putString("icon", notification.getIcon());
        }
        if (notification.getLink() != null) {
          notificationMap.putString("link", notification.getLink().toString());
        }
        if (notification.getSound() != null) {
          notificationMap.putString("sound", notification.getSound());
        }
        if (notification.getTag() != null) {
          notificationMap.putString("tag", notification.getTag());
        }
        if (notification.getTitle() != null) {
          notificationMap.putString("title", notification.getTitle());
        }
        if (notification.getTitleLocalizationArgs() != null) {
          WritableArray titleArgs = Arguments.createArray();
          for (String arg : notification.getTitleLocalizationArgs()) {
            titleArgs.pushString(arg);
          }
          notificationMap.putArray("titleLocalizationArgs", titleArgs);
        }
        if (notification.getTitleLocalizationKey() != null) {
          notificationMap.putString("titleLocalizationKey", notification.getTitleLocalizationKey());
        }

        messageMap.putMap("notification", notificationMap);
      }

      messageMap.putBoolean("openedFromTray", false);
      messageMap.putDouble("sentTime", message.getSentTime());

      if (message.getTo() != null) {
        messageMap.putString("to", message.getTo());
      }

      messageMap.putDouble("ttl", message.getTtl());

      return messageMap;
    }
  }

  private class RefreshTokenReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      if (getReactApplicationContext().hasActiveCatalystInstance()) {
        String token = FirebaseInstanceId.getInstance().getToken();
        Log.d(TAG, "Received new token: " + token);

        Utils.sendEvent(getReactApplicationContext(), "messaging_token_refreshed", token);
      }
    }
  }
}
