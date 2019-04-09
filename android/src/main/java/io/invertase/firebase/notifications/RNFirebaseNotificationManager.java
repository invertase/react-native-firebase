package io.invertase.firebase.notifications;

import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.service.notification.StatusBarNotification;
import android.support.annotation.RequiresApi;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;

import io.invertase.firebase.Utils;
import io.invertase.firebase.messaging.BundleJSONConverter;

class RNFirebaseNotificationManager {
  static final String SCHEDULED_NOTIFICATION_EVENT = "notifications-scheduled-notification";
  private static final String PREFERENCES_KEY = "RNFNotifications";
  private static final String TAG = "RNFNotificationManager";
  private AlarmManager alarmManager;
  private Context context;
  private ReactApplicationContext reactContext;
  private NotificationManager notificationManager;
  private SharedPreferences preferences;

  RNFirebaseNotificationManager(ReactApplicationContext reactContext) {
    this(reactContext.getApplicationContext());
    this.reactContext = reactContext;
  }

  RNFirebaseNotificationManager(Context context) {
    this.alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    this.context = context;
    this.notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    this.preferences = context.getSharedPreferences(PREFERENCES_KEY, Context.MODE_PRIVATE);
  }

  static int getResourceId(Context context, String type, String image) {
    return context
      .getResources()
      .getIdentifier(image, type, context.getPackageName());
  }

  static Uri getSound(Context context, String sound) {
    if (sound == null) {
      return null;
    } else if (sound.contains("://")) {
      return Uri.parse(sound);
    } else if (sound.equalsIgnoreCase("default")) {
      return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
    } else {
      int soundResourceId = getResourceId(context, "raw", sound);
      if (soundResourceId == 0) {
        soundResourceId = getResourceId(context, "raw", sound.substring(0, sound.lastIndexOf('.')));
      }
      return Uri.parse("android.resource://" + context.getPackageName() + "/" + soundResourceId);
    }
  }

  void cancelAllNotifications(Promise promise) {
    try {
      Map<String, ?> notifications = preferences.getAll();

      for (String notificationId : notifications.keySet()) {
        cancelAlarm(notificationId);
      }

      preferences
        .edit()
        .clear()
        .apply();

      promise.resolve(null);
    } catch (SecurityException e) {
      // TODO: Identify what these situations are
      // In some devices/situations cancelAllLocalNotifications can throw a SecurityException.
      Log.e(TAG, e.getMessage());
      promise.reject(
        "notification/cancel_notifications_error",
        "Could not cancel notifications",
        e
      );
    }
  }

  void cancelNotification(String notificationId, Promise promise) {
    try {
      cancelAlarm(notificationId);
      preferences
        .edit()
        .remove(notificationId)
        .apply();
      promise.resolve(null);
    } catch (SecurityException e) {
      // TODO: Identify what these situations are
      // In some devices/situations cancelAllLocalNotifications can throw a SecurityException.
      Log.e(TAG, e.getMessage());
      promise.reject("notification/cancel_notification_error", "Could not cancel notifications", e);
    }
  }

  void createChannel(ReadableMap channelMap) {
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationChannel channel = parseChannelMap(channelMap);
      notificationManager.createNotificationChannel(channel);
    }
  }

  void createChannelGroup(ReadableMap channelGroupMap) {
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationChannelGroup channelGroup = parseChannelGroupMap(channelGroupMap);
      notificationManager.createNotificationChannelGroup(channelGroup);
    }
  }

  void createChannelGroups(ReadableArray channelGroupsArray) {
    if (Build.VERSION.SDK_INT >= 26) {
      List<NotificationChannelGroup> channelGroups = new ArrayList<>();
      for (int i = 0; i < channelGroupsArray.size(); i++) {
        NotificationChannelGroup channelGroup = parseChannelGroupMap(channelGroupsArray.getMap(i));
        channelGroups.add(channelGroup);
      }
      notificationManager.createNotificationChannelGroups(channelGroups);
    }
  }

  void createChannels(ReadableArray channelsArray) {
    if (Build.VERSION.SDK_INT >= 26) {
      List<NotificationChannel> channels = new ArrayList<>();
      for (int i = 0; i < channelsArray.size(); i++) {
        NotificationChannel channel = parseChannelMap(channelsArray.getMap(i));
        channels.add(channel);
      }
      notificationManager.createNotificationChannels(channels);
    }
  }

  void deleteChannelGroup(String groupId) {
    if (Build.VERSION.SDK_INT >= 26) {
      notificationManager.deleteNotificationChannelGroup(groupId);
    }
  }

  void deleteChannel(String channelId) {
    if (Build.VERSION.SDK_INT >= 26) {
      notificationManager.deleteNotificationChannel(channelId);
    }
  }

  void displayNotification(ReadableMap notification, Promise promise) {
    Bundle notificationBundle = Arguments.toBundle(notification);
    displayNotification(notificationBundle, promise);
  }

  void displayScheduledNotification(Bundle notification) {
    // If this isn't a repeated notification, clear it from the scheduled notifications list
    if (!notification
      .getBundle("schedule")
      .containsKey("repeated")
      || !notification
      .getBundle("schedule")
      .getBoolean("repeated")) {
      String notificationId = notification.getString("notificationId");
      preferences
        .edit()
        .remove(notificationId)
        .apply();
    }

    if (Utils.isAppInForeground(context)) {
      // If the app is in the foreground, broadcast the notification to the RN Application
      // It is up to the JS to decide whether to display the notification
      Intent scheduledNotificationEvent = new Intent(SCHEDULED_NOTIFICATION_EVENT);
      scheduledNotificationEvent.putExtra("notification", notification);
      LocalBroadcastManager
        .getInstance(context)
        .sendBroadcast(scheduledNotificationEvent);
    } else {
      // If the app is in the background, then we display it automatically
      displayNotification(notification, null);
    }
  }

  WritableMap getChannel(String channelId) {
    if (Build.VERSION.SDK_INT >= 26) {
      return createChannelMap(notificationManager.getNotificationChannel(channelId));
    }

    return null;
  }

  WritableArray getChannels() {
    if (Build.VERSION.SDK_INT >= 26) {
      return createChannelsArray(notificationManager.getNotificationChannels());
    }

    return null;
  }

  WritableMap getChannelGroup(String channelGroupId) {
    if (Build.VERSION.SDK_INT >= 28) {
      return createChannelGroupMap(notificationManager.getNotificationChannelGroup(channelGroupId));
    }

    return null;
  }

  WritableArray getChannelGroups() {
    if (Build.VERSION.SDK_INT >= 26) {
      return createChannelGroupsArray(notificationManager.getNotificationChannelGroups());
    }

    return null;
  }

  ArrayList<Bundle> getScheduledNotifications() {
    ArrayList<Bundle> array = new ArrayList<>();

    Map<String, ?> notifications = preferences.getAll();

    for (String notificationId : notifications.keySet()) {
      try {
        JSONObject json = new JSONObject((String) notifications.get(notificationId));
        Bundle bundle = BundleJSONConverter.convertToBundle(json);
        array.add(bundle);
      } catch (JSONException e) {
        Log.e(TAG, e.getMessage());
      }
    }
    return array;
  }

  void removeAllDeliveredNotifications(Promise promise) {
    notificationManager.cancelAll();
    promise.resolve(null);
  }

  void removeDeliveredNotification(String notificationId, Promise promise) {
    notificationManager.cancel(notificationId.hashCode());
    promise.resolve(null);
  }

  void removeDeliveredNotificationsByTag(String tag, Promise promise) {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
      StatusBarNotification[] statusBarNotifications = notificationManager.getActiveNotifications();
      for (StatusBarNotification statusBarNotification : statusBarNotifications) {
        if (tag.equals(statusBarNotification.getTag())) {
          notificationManager.cancel(statusBarNotification.getTag(), statusBarNotification.getId());
        }
      }
    }

    promise.resolve(null);
  }

  void rescheduleNotifications() {
    ArrayList<Bundle> bundles = getScheduledNotifications();
    for (Bundle bundle : bundles) {
      scheduleNotification(bundle, null);
    }
  }

  void scheduleNotification(ReadableMap notification, Promise promise) {
    Bundle notificationBundle = Arguments.toBundle(notification);

    scheduleNotification(notificationBundle, promise);
  }

  private void cancelAlarm(String notificationId) {
    Intent notificationIntent = new Intent(context, RNFirebaseNotificationReceiver.class);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(
      context,
      notificationId.hashCode(),
      notificationIntent,
      PendingIntent.FLAG_UPDATE_CURRENT
    );
    alarmManager.cancel(pendingIntent);
  }

  private void displayNotification(Bundle notification, Promise promise) {
    new DisplayNotificationTask(
      context,
      reactContext,
      notificationManager,
      notification,
      promise
    ).execute();
  }

  private NotificationChannelGroup parseChannelGroupMap(ReadableMap channelGroupMap) {
    if (Build.VERSION.SDK_INT >= 26) {
      String groupId = channelGroupMap.getString("groupId");
      String name = channelGroupMap.getString("name");

      NotificationChannelGroup notificationChannelGroup = new NotificationChannelGroup(
        groupId,
        name
      );

      if (Build.VERSION.SDK_INT >= 28 && channelGroupMap.hasKey("description")) {
        String description = channelGroupMap.getString("description");
        notificationChannelGroup.setDescription(description);
      }

      return notificationChannelGroup;
    }

    return null;
  }

  private String getFileName(Uri uri) {
    String result = null;
    if (uri.getScheme() == "content") {
      Cursor cursor = reactContext.getContentResolver().query(uri, null, null, null, null);
      try {
        if (cursor != null && cursor.moveToFirst()) {
          result = cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME));
        }
      } finally {
        if (cursor != null) cursor.close();
      }
    }

    if (result == null) {
      result = uri.getPath();
      if (result != null) {
        int cut = result.lastIndexOf('/');
        if (cut != -1) {
          result = result.substring(cut + 1);
        } else {
          result = "default";
        }
      }
    }

    if (result.equals("notification_sound")) result = "default";

    return result;
  }

  @RequiresApi(api = 26)
  private WritableArray createChannelsArray(List<NotificationChannel> notificationChannels) {
    WritableArray writableArray = Arguments.createArray();

    if (Build.VERSION.SDK_INT >= 26) {
      int size = notificationChannels.size();
      for (int i = 0; i < size; i++) {
        writableArray.pushMap(createChannelMap(notificationChannels.get(i)));
      }
    }

    return writableArray;
  }

  @RequiresApi(api = 26)
  private WritableArray createChannelGroupsArray(List<NotificationChannelGroup> notificationChannelGroups) {
    WritableArray writableArray = Arguments.createArray();

    if (Build.VERSION.SDK_INT >= 26) {
      int size = notificationChannelGroups.size();
      for (int i = 0; i < size; i++) {
        writableArray.pushMap(createChannelGroupMap(notificationChannelGroups.get(i)));
      }
    }

    return writableArray;
  }

  @RequiresApi(api = 26)
  private WritableMap createChannelGroupMap(NotificationChannelGroup notificationChannelGroup) {
    WritableMap writableMap = Arguments.createMap();

    if (Build.VERSION.SDK_INT >= 26) {
      writableMap.putString("groupId", notificationChannelGroup.getId());
      writableMap.putString("name", notificationChannelGroup.getName().toString());
      writableMap.putArray("channels", createChannelsArray(notificationChannelGroup.getChannels()));
      if (Build.VERSION.SDK_INT >= 28) {
        writableMap.putString("description", notificationChannelGroup.getDescription());
      }
    }

    return writableMap;
  }

  @RequiresApi(api = 26)
  private WritableMap createChannelMap(NotificationChannel notificationChannel) {
    if (notificationChannel == null) return null;
    WritableMap writableMap = Arguments.createMap();

    if (Build.VERSION.SDK_INT >= 26) {
      writableMap.putString("channelId", notificationChannel.getId());
      writableMap.putString("name", notificationChannel.getName().toString());
      writableMap.putInt("importance", notificationChannel.getImportance());
      writableMap.putString("description", notificationChannel.getDescription());

      writableMap.putBoolean("bypassDnd", notificationChannel.canBypassDnd());
      writableMap.putString("group", notificationChannel.getGroup());
      writableMap.putString(
        "lightColor",
        String.format("#%06X", (0xFFFFFF & notificationChannel.getLightColor()))
      );
      writableMap.putBoolean("lightsEnabled", notificationChannel.shouldShowLights());

      int visibility = notificationChannel.getLockscreenVisibility();
      if (visibility == -1000) { // -1000 = not set
        writableMap.putNull("lockScreenVisibility");
      } else {
        writableMap.putInt("lockScreenVisibility", visibility);
      }

      writableMap.putBoolean("showBadge", notificationChannel.canShowBadge());
      writableMap.putString("sound", getFileName(notificationChannel.getSound()));
      writableMap.putBoolean("vibrationEnabled", notificationChannel.shouldVibrate());

      long[] vibration = notificationChannel.getVibrationPattern();
      WritableArray vibrationArray = Arguments.createArray();
      if (vibration != null) {
        for (long aVibration : vibration) {
          vibrationArray.pushDouble(aVibration);
        }
      }
      writableMap.putArray("vibrationPattern", vibrationArray);
    }

    return writableMap;
  }

  @RequiresApi(api = 26)
  private NotificationChannel parseChannelMap(ReadableMap channelMap) {
    if (Build.VERSION.SDK_INT >= 26) {
      String channelId = channelMap.getString("channelId");
      String name = channelMap.getString("name");
      int importance = channelMap.getInt("importance");

      NotificationChannel channel = new NotificationChannel(channelId, name, importance);
      if (channelMap.hasKey("bypassDnd")) {
        channel.setBypassDnd(channelMap.getBoolean("bypassDnd"));
      }
      if (channelMap.hasKey("description")) {
        channel.setDescription(channelMap.getString("description"));
      }
      if (channelMap.hasKey("group")) {
        channel.setGroup(channelMap.getString("group"));
      }
      if (channelMap.hasKey("lightColor")) {
        String lightColor = channelMap.getString("lightColor");
        channel.setLightColor(Color.parseColor(lightColor));
      }
      if (channelMap.hasKey("lightsEnabled")) {
        channel.enableLights(channelMap.getBoolean("lightsEnabled"));
      }
      if (channelMap.hasKey("lockScreenVisibility")) {
        channel.setLockscreenVisibility(channelMap.getInt("lockScreenVisibility"));
      }
      if (channelMap.hasKey("showBadge")) {
        channel.setShowBadge(channelMap.getBoolean("showBadge"));
      }
      if (channelMap.hasKey("sound")) {
        Uri sound = getSound(context, channelMap.getString("sound"));
        channel.setSound(sound, null);
      }
      if (channelMap.hasKey("vibrationEnabled")) {
        channel.enableVibration(channelMap.getBoolean("vibrationEnabled"));
      }
      if (channelMap.hasKey("vibrationPattern")) {
        ReadableArray vibrationArray = channelMap.getArray("vibrationPattern");
        long[] vibration = new long[vibrationArray.size()];
        for (int i = 0; i < vibrationArray.size(); i++) {
          vibration[i] = (long) vibrationArray.getDouble(i);
        }
        channel.setVibrationPattern(vibration);
      }
      return channel;
    }

    return null;
  }

  @SuppressLint("ShortAlarm")
  private void scheduleNotification(Bundle notification, @Nullable Promise promise) {
    if (!notification.containsKey("notificationId")) {
      if (promise == null) {
        Log.e(TAG, "Missing notificationId");
      } else {
        promise.reject("notification/schedule_notification_error", "Missing notificationId");
      }
      return;
    }

    if (!notification.containsKey("schedule")) {
      if (promise == null) {
        Log.e(TAG, "Missing schedule information");
      } else {
        promise.reject("notification/schedule_notification_error", "Missing schedule information");
      }
      return;
    }

    String notificationId = notification.getString("notificationId");
    Bundle schedule = notification.getBundle("schedule");

    // fireDate may be stored in the Bundle as 2 different types that we need to handle:
    // 1. Double - when a call comes directly from React
    // 2. Long   - when notifications are rescheduled from boot service (Bundle is loaded from preferences).
    // At the end we need Long value (timestamp) for the scheduler
    Long fireDate = -1L;
    Object fireDateObject = schedule.get("fireDate");
    if (fireDateObject instanceof Long) {
      fireDate = (Long) fireDateObject;
    } else if (fireDateObject instanceof Double) {
      Double fireDateDouble = (Double) fireDateObject;
      fireDate = fireDateDouble.longValue();
    }

    if (fireDate == -1) {
      if (promise == null) {
        Log.e(TAG, "Missing schedule information");
      } else {
        promise.reject("notification/schedule_notification_error", "Missing fireDate information");
      }
      return;
    }

    // Scheduled alarms are cleared on restart
    // We store them so that they can be re-scheduled when the phone restarts in RNFirebaseNotificationsRebootReceiver
    try {
      JSONObject json = BundleJSONConverter.convertToJSON(notification);
      preferences
        .edit()
        .putString(notificationId, json.toString())
        .apply();
    } catch (JSONException e) {
      if (promise == null) {
        Log.e(TAG, "Failed to store notification");
      } else {
        promise.reject(
          "notification/schedule_notification_error",
          "Failed to store notification",
          e
        );
      }
      return;
    }

    Intent notificationIntent = new Intent(context, RNFirebaseNotificationReceiver.class);
    notificationIntent.putExtras(notification);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(
      context,
      notificationId.hashCode(),
      notificationIntent,
      PendingIntent.FLAG_UPDATE_CURRENT
    );

    if (schedule.containsKey("repeatInterval")) {
      // If fireDate you specify is in the past, the alarm triggers immediately.
      // So we need to adjust the time for correct operation.
      if (fireDate < System.currentTimeMillis()) {
        Log.w(TAG, "Scheduled notification date is in the past, will adjust it to be in future");
        Calendar newFireDate = Calendar.getInstance();
        Calendar pastFireDate = Calendar.getInstance();
        pastFireDate.setTimeInMillis(fireDate);

        newFireDate.set(Calendar.SECOND, pastFireDate.get(Calendar.SECOND));

        switch (schedule.getString("repeatInterval")) {
          case "minute":
            newFireDate.add(Calendar.MINUTE, 1);
            break;
          case "hour":
            newFireDate.set(Calendar.MINUTE, pastFireDate.get(Calendar.MINUTE));
            newFireDate.add(Calendar.HOUR, 1);
            break;
          case "day":
            newFireDate.set(Calendar.MINUTE, pastFireDate.get(Calendar.MINUTE));
            newFireDate.set(Calendar.HOUR_OF_DAY, pastFireDate.get(Calendar.HOUR_OF_DAY));
            newFireDate.add(Calendar.DATE, 1);
            break;
          case "week":
            newFireDate.set(Calendar.MINUTE, pastFireDate.get(Calendar.MINUTE));
            newFireDate.set(Calendar.HOUR_OF_DAY, pastFireDate.get(Calendar.HOUR_OF_DAY));
            newFireDate.set(Calendar.DATE, pastFireDate.get(Calendar.DATE));
            newFireDate.add(Calendar.DATE, 7);
            break;
        }

        fireDate = newFireDate.getTimeInMillis();
      }

      Long interval = null;
      switch (schedule.getString("repeatInterval")) {
        case "minute":
          interval = 60000L;
          break;
        case "hour":
          interval = AlarmManager.INTERVAL_HOUR;
          break;
        case "day":
          interval = AlarmManager.INTERVAL_DAY;
          break;
        case "week":
          interval = AlarmManager.INTERVAL_DAY * 7;
          break;
        default:
          Log.e(TAG, "Invalid interval: " + schedule.getString("interval"));
          break;
      }

      if (interval == null) {
        if (promise == null) {
          Log.e(TAG, "Invalid interval");
        } else {
          promise.reject("notification/schedule_notification_error", "Invalid interval");
        }
        return;
      }

      alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, fireDate, interval, pendingIntent);
    } else {
      if (schedule.containsKey("exact")
        && schedule.getBoolean("exact")
        && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        alarmManager.setExact(AlarmManager.RTC_WAKEUP, fireDate, pendingIntent);
      } else {
        alarmManager.set(AlarmManager.RTC_WAKEUP, fireDate, pendingIntent);
      }
    }

    if (promise != null) {
      promise.resolve(null);
    }
  }
}
