package io.invertase.firebase.notifications;


import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.RemoteInput;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import io.invertase.firebase.Utils;
import io.invertase.firebase.messaging.BundleJSONConverter;

public class RNFirebaseNotificationManager {
  private static final String PREFERENCES_KEY = "RNFNotifications";
  public static final String SCHEDULED_NOTIFICATION_EVENT = "notifications-scheduled-notification";
  private static final String TAG = "RNFNotificationManager";
  private AlarmManager alarmManager;
  private Context context;
  private ReactApplicationContext reactContext;
  private NotificationManager notificationManager;
  private SharedPreferences preferences;

  public RNFirebaseNotificationManager(ReactApplicationContext reactContext) {
    this(reactContext.getApplicationContext());
    this.reactContext = reactContext;
  }

  public RNFirebaseNotificationManager(Context context) {
    this.alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    this.context = context;
    this.notificationManager =  (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    this.preferences = context.getSharedPreferences(PREFERENCES_KEY, Context.MODE_PRIVATE);
  }

  public void cancelAllNotifications(Promise promise) {
    try {
      Map<String, ?> notifications = preferences.getAll();

      for(String notificationId : notifications.keySet()){
        cancelAlarm(notificationId);
      }
      preferences.edit().clear().apply();
      promise.resolve(null);
    } catch (SecurityException e) {
      // TODO: Identify what these situations are
      // In some devices/situations cancelAllLocalNotifications can throw a SecurityException.
      Log.e(TAG, e.getMessage());
      promise.reject("notification/cancel_notifications_error", "Could not cancel notifications", e);
    }
  }

  public void cancelNotification(String notificationId, Promise promise) {
    try {
      cancelAlarm(notificationId);
      preferences.edit().remove(notificationId).apply();
    } catch (SecurityException e) {
      // TODO: Identify what these situations are
      // In some devices/situations cancelAllLocalNotifications can throw a SecurityException.
      Log.e(TAG, e.getMessage());
      promise.reject("notification/cancel_notification_error", "Could not cancel notifications", e);
    }
  }

  public void createChannel(ReadableMap channelMap) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = parseChannelMap(channelMap);
      notificationManager.createNotificationChannel(channel);
    }
  }

  public void createChannelGroup(ReadableMap channelGroupMap) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannelGroup channelGroup = parseChannelGroupMap(channelGroupMap);
      notificationManager.createNotificationChannelGroup(channelGroup);
    }
  }

  public void createChannelGroups(ReadableArray channelGroupsArray) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      List<NotificationChannelGroup> channelGroups = new ArrayList<>();
      for (int i = 0; i < channelGroupsArray.size(); i++) {
        NotificationChannelGroup channelGroup = parseChannelGroupMap(channelGroupsArray.getMap(i));
        channelGroups.add(channelGroup);
      }
      notificationManager.createNotificationChannelGroups(channelGroups);
    }
  }

  public void createChannels(ReadableArray channelsArray) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      List<NotificationChannel> channels = new ArrayList<>();
      for (int i = 0; i < channelsArray.size(); i++) {
        NotificationChannel channel = parseChannelMap(channelsArray.getMap(i));
        channels.add(channel);
      }
      notificationManager.createNotificationChannels(channels);
    }
  }

  public void displayNotification(ReadableMap notification, Promise promise) {
    Bundle notificationBundle = Arguments.toBundle(notification);
    displayNotification(notificationBundle, promise);
  }

  public void displayScheduledNotification(Bundle notification) {
    // If this isn't a repeated notification, clear it from the scheduled notifications list
    if (!notification.getBundle("schedule").containsKey("repeated")
      || !notification.getBundle("schedule").getBoolean("repeated")) {
      String notificationId = notification.getString("notificationId");
      preferences.edit().remove(notificationId).apply();;
    }

    if (Utils.isAppInForeground(context)) {
      // If the app is in the foregound, broadcast the notification to the RN Application
      // It is up to the JS to decide whether to display the notification
      Intent scheduledNotificationEvent = new Intent(SCHEDULED_NOTIFICATION_EVENT);
      scheduledNotificationEvent.putExtra("notification", notification);
      LocalBroadcastManager.getInstance(context).sendBroadcast(scheduledNotificationEvent);
    } else {
      // If the app is in the background, then we display it automatically
      displayNotification(notification, null);
    }
  }

  public ArrayList<Bundle> getScheduledNotifications(){
    ArrayList<Bundle> array = new ArrayList<>();

    Map<String, ?> notifications = preferences.getAll();

    for(String notificationId : notifications.keySet()){
      try {
        JSONObject json = new JSONObject((String)notifications.get(notificationId));
        Bundle bundle = BundleJSONConverter.convertToBundle(json);
        array.add(bundle);
      } catch (JSONException e) {
        Log.e(TAG, e.getMessage());
      }
    }
    return array;
  }

  public void removeAllDeliveredNotifications(Promise promise) {
    notificationManager.cancelAll();
    promise.resolve(null);
  }

  public void removeDeliveredNotification(String notificationId, Promise promise) {
    notificationManager.cancel(notificationId.hashCode());
    promise.resolve(null);
  }


  public void rescheduleNotifications() {
    ArrayList<Bundle> bundles = getScheduledNotifications();
    for(Bundle bundle: bundles){
      scheduleNotification(bundle, null);
    }
  }

  public void scheduleNotification(ReadableMap notification, Promise promise) {
    Bundle notificationBundle = Arguments.toBundle(notification);

    scheduleNotification(notificationBundle, promise);
  }

  private void cancelAlarm(String notificationId) {
    Intent notificationIntent = new Intent(context, RNFirebaseNotificationReceiver.class);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, notificationId.hashCode(), notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);
    alarmManager.cancel(pendingIntent);
  }

  private void displayNotification(Bundle notification, Promise promise) {
    new DisplayNotificationTask(context, reactContext, notificationManager, notification, promise).execute();
  }

  public static int getResourceId(Context context, String type, String image) {
    return context.getResources().getIdentifier(image, type, context.getPackageName());
  }

  public static Uri getSound(Context context, String sound) {
    if (sound == null) {
      return null;
    } else if (sound.contains("://")) {
      return Uri.parse(sound);
    } else if (sound.equalsIgnoreCase("default")) {
      return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
    } else {
      int soundResourceId = getResourceId(context,"raw", sound);
      if (soundResourceId == 0) {
        soundResourceId = getResourceId(context,"raw", sound.substring(0, sound.lastIndexOf('.')));
      }
      return Uri.parse("android.resource://" + context.getPackageName() + "/" + soundResourceId);
    }
  }

  private NotificationChannelGroup parseChannelGroupMap(ReadableMap channelGroupMap) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      String groupId = channelGroupMap.getString("groupId");
      String name = channelGroupMap.getString("name");

      return new NotificationChannelGroup(groupId, name);
    }
    return null;
  }

  private NotificationChannel parseChannelMap(ReadableMap channelMap) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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
        long[] vibration = new long[]{};
        for (int i = 0; i < vibrationArray.size(); i++) {
          vibration[i] = (long) vibrationArray.getDouble(i);
        }
        channel.setVibrationPattern(vibration);
      }
      return channel;
    }
    return null;
  }

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

    // fireDate is stored in the Bundle as Long after notifications are rescheduled.
    // This would lead to a fireDate of 0.0 when trying to extract a Double from the bundle.
    // Instead always try extract a Long
    Long fireDate = schedule.getLong("fireDate", -1);
    if (fireDate == -1) {
      fireDate = (long) schedule.getDouble("fireDate", -1);
      if (fireDate == -1) {
        if (promise == null) {
          Log.e(TAG, "Missing schedule information");
        } else {
          promise.reject("notification/schedule_notification_error", "Missing fireDate information");
        }
        return;
      }
    }

    // Scheduled alarms are cleared on restart
    // We store them so that they can be re-scheduled when the phone restarts in RNFirebaseNotificationsRebootReceiver
    try {
      JSONObject json = BundleJSONConverter.convertToJSON(notification);
      preferences.edit().putString(notificationId, json.toString()).apply();
    } catch (JSONException e) {
      if (promise == null) {
        Log.e(TAG, "Failed to store notification");
      } else {
        promise.reject("notification/schedule_notification_error", "Failed to store notification", e);
      }
      return;
    }

    Intent notificationIntent = new Intent(context, RNFirebaseNotificationReceiver.class);
    notificationIntent.putExtras(notification);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, notificationId.hashCode(),
      notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    if (schedule.containsKey("repeatInterval")) {
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

      alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, fireDate.longValue(), interval, pendingIntent);
    } else {
      if (schedule.containsKey("exact")
        && schedule.getBoolean("exact")
        && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        alarmManager.setExact(AlarmManager.RTC_WAKEUP, fireDate.longValue(), pendingIntent);
      } else {
        alarmManager.set(AlarmManager.RTC_WAKEUP, fireDate.longValue(), pendingIntent);
      }
    }

    if (promise != null) {
      promise.resolve(null);
    }
  }
}
