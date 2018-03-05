package io.invertase.firebase.notifications;

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
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;

import java.util.ArrayList;
import java.util.Map;

import io.invertase.firebase.Utils;
import io.invertase.firebase.messaging.RNFirebaseMessagingService;
import me.leolin.shortcutbadger.ShortcutBadger;

public class RNFirebaseNotifications extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {
  private static final String BADGE_FILE = "BadgeCountFile";
  private static final String BADGE_KEY = "BadgeCount";
  private static final String TAG = "RNFirebaseNotifications";

  private SharedPreferences sharedPreferences = null;

  private RNFirebaseNotificationManager notificationManager;
  public RNFirebaseNotifications(ReactApplicationContext context) {
    super(context);
    context.addActivityEventListener(this);
    context.addLifecycleEventListener(this);

    notificationManager = new RNFirebaseNotificationManager(context.getApplicationContext());
    sharedPreferences = context.getSharedPreferences(BADGE_FILE, Context.MODE_PRIVATE);

    LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(context);

    // Subscribe to remote notification events
    localBroadcastManager.registerReceiver(new RemoteNotificationReceiver(),
      new IntentFilter(RNFirebaseMessagingService.REMOTE_NOTIFICATION_EVENT));

    // Subscribe to scheduled notification events
    localBroadcastManager.registerReceiver(new ScheduledNotificationReceiver(),
      new IntentFilter(RNFirebaseNotificationManager.SCHEDULED_NOTIFICATION_EVENT));
  }

  @Override
  public String getName() {
    return "RNFirebaseNotifications";
  }

  @ReactMethod
  public void cancelAllNotifications() {
    notificationManager.cancelAllNotifications();
  }

  @ReactMethod
  public void cancelNotification(String notificationId) {
    notificationManager.cancelNotification(notificationId);
  }

  @ReactMethod
  public void displayNotification(ReadableMap notification, Promise promise) {
    notificationManager.displayNotification(notification, promise);
  }

  @ReactMethod
  public void getBadge(Promise promise) {
    int badge = sharedPreferences.getInt(BADGE_KEY, 0);
    Log.d(TAG, "Got badge count: " + badge);
    promise.resolve(badge);
  }

  @ReactMethod
  public void getInitialNotification(Promise promise) {
    // TODO
    if (getCurrentActivity() == null) {
      promise.resolve(null);
    } else {
      WritableMap notificationOpenedMap = parseIntentForRemoteNotification(getCurrentActivity().getIntent());
      promise.resolve(notificationOpenedMap);
    }
  }

  @ReactMethod
  public void getScheduledNotifications(Promise promise) {
    ArrayList<Bundle> bundles = notificationManager.getScheduledNotifications();
    WritableArray array = Arguments.createArray();
    for (Bundle bundle : bundles) {
      array.pushMap(parseNotificationBundle(bundle));
    }
    promise.resolve(array);
  }

  @ReactMethod
  public void removeAllDeliveredNotifications() {
    notificationManager.removeAllDeliveredNotifications();
  }

  @ReactMethod
  public void removeDeliveredNotification(String notificationId) {
    notificationManager.removeDeliveredNotification(notificationId);
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
  public void scheduleNotification(ReadableMap notification, Promise promise) {
    notificationManager.scheduleNotification(notification, promise);
  }

  //////////////////////////////////////////////////////////////////////
  // Start Android specific methods
  //////////////////////////////////////////////////////////////////////
  @ReactMethod
  public void createChannel(ReadableMap channelMap, Promise promise) {
    notificationManager.createChannel(channelMap);
    promise.resolve(null);
  }

  @ReactMethod
  public void createChannelGroup(ReadableMap channelGroupMap, Promise promise) {
    notificationManager.createChannelGroup(channelGroupMap);
    promise.resolve(null);
  }

  @ReactMethod
  public void createChannelGroup(ReadableArray channelGroupsArray, Promise promise) {
    notificationManager.createChannelGroups(channelGroupsArray);
    promise.resolve(null);
  }

  @ReactMethod
  public void createChannels(ReadableArray channelsArray, Promise promise) {
    notificationManager.createChannels(channelsArray);
    promise.resolve(null);
  }
  //////////////////////////////////////////////////////////////////////
  // End Android specific methods
  //////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////
  // Start ActivityEventListener methods
  //////////////////////////////////////////////////////////////////////
  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    // FCM functionality does not need this function
  }

  @Override
  public void onNewIntent(Intent intent) {
    WritableMap notificationOpenedMap = parseIntentForRemoteNotification(intent);
    if (notificationOpenedMap != null) {
      Log.d(TAG, "onNewIntent called with new remote notification");
      Utils.sendEvent(getReactApplicationContext(), "notifications_notification_opened", notificationOpenedMap);
    }
  }
  //////////////////////////////////////////////////////////////////////
  // End ActivityEventListener methods
  //////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////
  // Start LifecycleEventListener methods
  //////////////////////////////////////////////////////////////////////
  @Override
  public void onHostResume() {
    notificationManager.setIsForeground(true);
  }

  @Override
  public void onHostPause() {
    notificationManager.setIsForeground(false);
  }

  @Override
  public void onHostDestroy() {
    // Do nothing
  }
  //////////////////////////////////////////////////////////////////////
  // End LifecycleEventListener methods
  //////////////////////////////////////////////////////////////////////


  private WritableMap parseIntentForRemoteNotification(Intent intent) {
    // Check if FCM data exists
    if (intent.getExtras() == null || !intent.hasExtra("google.message_id")) {
      return null;
    }

    Bundle extras = intent.getExtras();

    WritableMap notificationMap = Arguments.createMap();
    WritableMap dataMap = Arguments.createMap();

    for (String key : extras.keySet()) {
      if (key.equals("google.message_id")) {
        notificationMap.putString("notificationId", extras.getString(key));
      } else if (key.equals("collapse_key")
        || key.equals("from")
        || key.equals("google.sent_time")
        || key.equals("google.ttl")
        || key.equals("_fbSourceApplicationHasBeenSet")) {
        // ignore known unneeded fields
      } else {
        dataMap.putString(key, extras.getString(key));
      }
    }
    notificationMap.putMap("data", dataMap);

    WritableMap notificationOpenedMap = Arguments.createMap();
    notificationOpenedMap.putString("action", intent.getAction());
    notificationOpenedMap.putMap("notification", notificationMap);

    return notificationOpenedMap;
  }

  private WritableMap parseNotificationBundle(Bundle notification) {
    return Arguments.makeNativeMap(notification);
  }

  private WritableMap parseRemoteMessage(RemoteMessage message) {
    RemoteMessage.Notification notification = message.getNotification();

    WritableMap notificationMap = Arguments.createMap();
    WritableMap dataMap = Arguments.createMap();

    // Cross platform notification properties
    notificationMap.putString("body", notification.getBody());
    if (message.getData() != null) {
      for (Map.Entry<String, String> e : message.getData().entrySet()) {
        dataMap.putString(e.getKey(), e.getValue());
      }
    }
    notificationMap.putMap("data", dataMap);
    if (message.getMessageId() != null) {
      notificationMap.putString("notificationId", message.getMessageId());
    }
    if (notification.getSound() != null) {
      notificationMap.putString("sound", notification.getSound());
    }
    if (notification.getTitle() != null) {
      notificationMap.putString("title", notification.getTitle());
    }

    // Android specific notification properties
    WritableMap androidMap = Arguments.createMap();
    if (notification.getClickAction() != null) {
      androidMap.putString("clickAction", notification.getClickAction());
    }
    if (notification.getColor() != null) {
      androidMap.putString("color", notification.getColor());
    }
    if (notification.getIcon() != null) {
      WritableMap iconMap = Arguments.createMap();
      iconMap.putString("icon", notification.getIcon());
      androidMap.putMap("smallIcon", iconMap);
    }
    if (notification.getTag() != null) {
      androidMap.putString("group", notification.getTag());
    }

    return notificationMap;
  }

  private class RemoteNotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      if (getReactApplicationContext().hasActiveCatalystInstance()) {
        Log.d(TAG, "Received new remote notification");

        RemoteMessage message = intent.getParcelableExtra("notification");
        WritableMap messageMap = parseRemoteMessage(message);

        Utils.sendEvent(getReactApplicationContext(), "notifications_notification_received", messageMap);
      }
    }
  }

  private class ScheduledNotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      if (getReactApplicationContext().hasActiveCatalystInstance()) {
        Log.d(TAG, "Received new scheduled notification");

        Bundle notification = intent.getBundleExtra("notification");
        WritableMap messageMap = parseNotificationBundle(notification);

        Utils.sendEvent(getReactApplicationContext(), "notifications_notification_received", messageMap);
      }
    }
  }
}
