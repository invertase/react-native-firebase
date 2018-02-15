package io.invertase.firebase.notifications;


import android.app.AlarmManager;
import android.app.Notification;
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
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Map;

import io.invertase.firebase.messaging.BundleJSONConverter;

public class RNFirebaseNotificationManager {
  private static final String PREFERENCES_KEY = "RNFNotifications";
  public static final String SCHEDULED_NOTIFICATION_EVENT = "notifications-scheduled-notification";
  private static final String TAG = "RNFNotificationManager";
  private AlarmManager alarmManager;
  private Context context;
  private boolean isForeground = false;
  private NotificationManager notificationManager;
  private SharedPreferences preferences;

  public RNFirebaseNotificationManager(Context context) {
    this.alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    this.context = context;
    this.notificationManager =  (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    this.preferences = context.getSharedPreferences(PREFERENCES_KEY, Context.MODE_PRIVATE);
  }

  public void cancelAllNotifications() {
    try {
      Map<String, ?> notifications = preferences.getAll();

      for(String notificationId : notifications.keySet()){
        cancelAlarm(notificationId);
      }
      preferences.edit().clear().apply();
    } catch (SecurityException e) {
      // TODO: Identify what these situations are
      // In some devices/situations cancelAllLocalNotifications can throw a SecurityException.
      Log.e(TAG, e.getMessage());
    }
  }

  public void cancelNotification(String notificationId) {
    cancelAlarm(notificationId);
    preferences.edit().remove(notificationId).apply();
  }

  public void displayNotification(ReadableMap notification, Promise promise) {
    Bundle notificationBundle = Arguments.toBundle(notification);
    displayNotification(notificationBundle, promise);
  }

  public void displayScheduledNotification(Bundle notification) {
    // Broadcast the notification to the RN Application
    Intent scheduledNotificationEvent = new Intent(SCHEDULED_NOTIFICATION_EVENT);
    scheduledNotificationEvent.putExtra("notification", notification);
    LocalBroadcastManager.getInstance(context).sendBroadcast(scheduledNotificationEvent);

    // If this isn't a repeated notification, clear it from the scheduled notifications list
    if (!notification.getBundle("schedule").containsKey("repeated")
      || !notification.getBundle("schedule").getBoolean("repeated")) {
      String notificationId = notification.getString("notificationId");
      preferences.edit().remove(notificationId).apply();;
    }

    // If the app isn't in the foreground, then we display it
    // Otherwise, it is up to the JS to decide whether to send the notification
    if (!isForeground) {
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

  public void removeAllDeliveredNotifications() {
    notificationManager.cancelAll();
  }

  public void removeDeliveredNotification(String notificationId) {
    notificationManager.cancel(notificationId.hashCode());
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

  public void setIsForeground(boolean isForeground) {
    this.isForeground = isForeground;
  }

  private void cancelAlarm(String notificationId) {
    Intent notificationIntent = new Intent(context, RNFirebaseNotificationManager.class);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, notificationId.hashCode(), notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);
    alarmManager.cancel(pendingIntent);
  }

  private void displayNotification(Bundle notification, Promise promise) {
    try {
      Class intentClass = getMainActivityClass();
      if (intentClass == null) {
        if (promise != null) {
          promise.reject("notification/display_notification_error", "Could not find main activity class");
        }
        return;
      }

      String channelId = notification.getString("channelId");
      String notificationId = notification.getString("notificationId");

      NotificationCompat.Builder nb;
      // TODO: Change 27 to 'Build.VERSION_CODES.O_MR1' when using appsupport v27
      if (Build.VERSION.SDK_INT >= 27) {
         nb = new NotificationCompat.Builder(context, channelId);
      } else {
         nb = new NotificationCompat.Builder(context);
      }

      if (notification.containsKey("body")) {
        nb = nb.setContentText(notification.getString("body"));
      }
      if (notification.containsKey("data")) {
        nb = nb.setExtras(notification.getBundle("data"));
      }
      if (notification.containsKey("sound")) {
        String sound = notification.getString("sound");
        if (sound.equalsIgnoreCase("default")) {
          nb = nb.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION));
        } else {
          int soundResourceId = getResourceId("raw", sound);
          if (soundResourceId == 0) {
            soundResourceId = getResourceId("raw", sound.substring(0, sound.lastIndexOf('.')));
          }
          nb = nb.setSound(Uri.parse("android.resource://" + context.getPackageName() + "/" + soundResourceId));
        }
      }
      if (notification.containsKey("subtitle")) {
        nb = nb.setSubText(notification.getString("subtitle"));
      }
      if (notification.containsKey("title")) {
        nb = nb.setContentTitle(notification.getString("title"));
      }

      if (notification.containsKey("autoCancel")) {
        nb = nb.setAutoCancel(notification.getBoolean("autoCancel"));
      }
      if (notification.containsKey("badgeIconType")) {
        nb = nb.setBadgeIconType(notification.getInt("badgeIconType"));
      }
      if (notification.containsKey("category")) {
        nb = nb.setCategory(notification.getString("category"));
      }
      if (notification.containsKey("color")) {
        String color = notification.getString("color");
        nb = nb.setColor(Color.parseColor(color));
      }
      if (notification.containsKey("colorized")) {
        nb = nb.setColorized(notification.getBoolean("colorized"));
      }
      if (notification.containsKey("contentInfo")) {
        nb = nb.setContentInfo(notification.getString("contentInfo"));
      }
      if (notification.containsKey("defaults")) {
        int[] defaultsArray = notification.getIntArray("defaults");
        int defaults = 0;
        for (int d : defaultsArray) {
          defaults |= d;
        }
        nb = nb.setDefaults(defaults);
      }
      if (notification.containsKey("group")) {
        nb = nb.setGroup(notification.getString("group"));
      }
      if (notification.containsKey("groupAlertBehaviour")) {
        nb = nb.setGroupAlertBehavior(notification.getInt("groupAlertBehaviour"));
      }
      if (notification.containsKey("groupSummary")) {
        nb = nb.setGroupSummary(notification.getBoolean("groupSummary"));
      }
      if (notification.containsKey("largeIcon")) {
        Bitmap largeIcon = getBitmap(notification.getString("largeIcon"));
        if (largeIcon != null) {
          nb = nb.setLargeIcon(largeIcon);
        }
      }
      if (notification.containsKey("lights")) {
        Bundle lights = notification.getBundle("lights");
        nb = nb.setLights(lights.getInt("argb"), lights.getInt("onMs"), lights.getInt("offMs"));
      }
      if (notification.containsKey("localOnly")) {
        nb = nb.setLocalOnly(notification.getBoolean("localOnly"));
      }

      if (notification.containsKey("number")) {
        nb = nb.setNumber(notification.getInt("number"));
      }
      if (notification.containsKey("ongoing")) {
        nb = nb.setOngoing(notification.getBoolean("ongoing"));
      }
      if (notification.containsKey("onlyAlertOnce")) {
        nb = nb.setOngoing(notification.getBoolean("onlyAlertOnce"));
      }
      if (notification.containsKey("people")) {
        String[] people = notification.getStringArray("people");
        for (String person : people) {
          nb = nb.addPerson(person);
        }
      }
      if (notification.containsKey("priority")) {
        nb = nb.setPriority(notification.getInt("priority"));
      }
      if (notification.containsKey("progress")) {
        Bundle progress = notification.getBundle("lights");
        nb = nb.setProgress(progress.getInt("max"), progress.getInt("progress"), progress.getBoolean("indeterminate"));
      }
      // TODO: Public version of notification
      /* if (notification.containsKey("publicVersion")) {
        nb = nb.setPublicVersion();
      } */
      if (notification.containsKey("remoteInputHistory")) {
        nb = nb.setRemoteInputHistory(notification.getStringArray("remoteInputHistory"));
      }
      if (notification.containsKey("shortcutId")) {
        nb = nb.setShortcutId(notification.getString("shortcutId"));
      }
      if (notification.containsKey("showWhen")) {
        nb = nb.setShowWhen(notification.getBoolean("showWhen"));
      }
      if (notification.containsKey("smallIcon")) {
        Bundle smallIcon = notification.getBundle("smallIcon");
        int smallIconResourceId = getResourceId("mipmap", smallIcon.getString("icon"));
        if (smallIconResourceId == 0) {
          smallIconResourceId = getResourceId("drawable", smallIcon.getString("icon"));
        }
        if (smallIconResourceId != 0) {
          if (smallIcon.containsKey("level")) {
            nb = nb.setSmallIcon(smallIconResourceId, smallIcon.getInt("level"));
          } else {
            nb = nb.setSmallIcon(smallIconResourceId);
          }
        }
      }
      if (notification.containsKey("sortKey")) {
        nb = nb.setSortKey(notification.getString("sortKey"));
      }
      if (notification.containsKey("ticker")) {
        nb = nb.setTicker(notification.getString("ticker"));
      }
      if (notification.containsKey("timeoutAfter")) {
        nb = nb.setTimeoutAfter(notification.getLong("timeoutAfter"));
      }
      if (notification.containsKey("usesChronometer")) {
        nb = nb.setUsesChronometer(notification.getBoolean("usesChronometer"));
      }
      if (notification.containsKey("vibrate")) {
        nb = nb.setVibrate(notification.getLongArray("vibrate"));
      }
      if (notification.containsKey("visibility")) {
        nb = nb.setVisibility(notification.getInt("visibility"));
      }
      if (notification.containsKey("when")) {
        nb = nb.setWhen(notification.getLong("when"));
      }

      // TODO: Big text / Big picture
      /* String bigText = bundle.getString("big_text");
      if(bigText != null){
        notification.setStyle(new NotificationCompat.BigTextStyle().bigText(bigText));
      }
      String picture = bundle.getString("picture");
      if(picture!=null){
        NotificationCompat.BigPictureStyle bigPicture = new NotificationCompat.BigPictureStyle();

        Bitmap pictureBitmap = getBitmap(picture);
        if (pictureBitmap != null) {
          bigPicture.bigPicture(pictureBitmap);
        }
        bigPicture.setBigContentTitle(title);
        bigPicture.setSummaryText(bundle.getString("body"));

        notification.setStyle(bigPicture);
      } */

      // Create the notification intent
      Intent intent = new Intent(context, intentClass);
      intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
      intent.putExtras(notification);
      if (notification.containsKey("clickAction")) {
        intent.setAction(notification.getString("clickAction"));
      }

      PendingIntent contentIntent = PendingIntent.getActivity(context, notificationId.hashCode(), intent,
        PendingIntent.FLAG_UPDATE_CURRENT);
      nb = nb.setContentIntent(contentIntent);

      // Build the notification and send it
      Notification builtNotification = nb.build();
      notificationManager.notify(notificationId.hashCode(), builtNotification);
    } catch (Exception e) {
      if (promise == null) {
        Log.e(TAG, "Failed to send notification", e);
      } else {
        promise.reject("notification/display_notification_error", "Could not send notification", e);
      }
    }
  }

  private Bitmap getBitmap(String image) {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return getBitmapFromUrl(image);
    } else {
      int largeIconResId = getResourceId("mipmap", image);
      return BitmapFactory.decodeResource(context.getResources(), largeIconResId);
    }
  }

  private Bitmap getBitmapFromUrl(String imageUrl) {
    try {
      HttpURLConnection connection = (HttpURLConnection) new URL(imageUrl).openConnection();
      connection.setDoInput(true);
      connection.connect();
      return BitmapFactory.decodeStream(connection.getInputStream());
    } catch (IOException e) {
      Log.e(TAG, "Failed to get bitmap for url: " + imageUrl, e);
      return null;
    }
  }

  private Class getMainActivityClass() {
    String packageName = context.getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    try {
      return Class.forName(launchIntent.getComponent().getClassName());
    } catch (ClassNotFoundException e) {
      Log.e(TAG, "Failed to get main activity class", e);
      return null;
    }
  }

  private int getResourceId(String type, String image) {
    return context.getResources().getIdentifier(image, type, context.getPackageName());
  }

  private void scheduleNotification(Bundle notification, Promise promise) {
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

    long fireDate = schedule.getLong("fireDate");

    // Scheduled alarms are cleared on restart
    // We store them so that they can be re-scheduled when the phone restarts in RNFirebaseNotificationsRebootReceiver
    try {
      JSONObject json = BundleJSONConverter.convertToJSON(notification);
      preferences.edit().putString(notificationId, json.toString()).apply();
    } catch (JSONException e) {
      promise.reject("notification/schedule_notification_error", "Failed to store notification", e);
      return;
    }

    Intent notificationIntent = new Intent(context, RNFirebaseNotificationReceiver.class);
    notificationIntent.putExtras(notification);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, notificationId.hashCode(),
      notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    if (schedule.containsKey("interval")) {
      Long interval = null;
      switch (schedule.getString("interval")) {
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
        promise.reject("notification/schedule_notification_error", "Invalid interval");
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

    promise.resolve(null);
  }
}
