package io.invertase.firebase.notifications;


import android.app.AlarmManager;
import android.app.Application;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Map;

import io.invertase.firebase.messaging.BundleJSONConverter;

public class RNFirebaseNotificationManager {
  private static final String PREFERENCES_KEY = "RNFNotifications";
  private static final String TAG = "RNFNotificationManager";
  private AlarmManager alarmManager;
  private Context context;
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

  public void displayNotification(Bundle notification) {
    displayNotification(notification, null);
  }

  public void displayNotification(ReadableMap notification, Promise promise) {
    Bundle notificationBundle = Arguments.toBundle(notification);
    displayNotification(notificationBundle, promise);
  }

  private void displayNotification(Bundle notification, Promise promise) {
    try {
      Class intentClass = getMainActivityClass();
      if (intentClass == null) {
        return;
      }

      if (bundle.getString("body") == null) {
        return;
      }

      Resources res = mContext.getResources();
      String packageName = mContext.getPackageName();

      String channelId = notification.getString("channelId");

      NotificationCompat.Builder nb = new NotificationCompat.Builder(context, channelId);

      if (notification.containsKey("body")) {
        nb = nb.setContentText(notification.getString("body"));
      }
      if (notification.containsKey("data")) {
        nb = nb.setExtras(notification.getBundle("data"));
      }
      if (notification.containsKey("sound")) {
        // TODO: Sound URI;
        nb = nb.setSound();
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
        nb = nb.setColor(notification.getInt("color"));
      }
      if (notification.containsKey("colorized")) {
        nb = nb.setColorized(notification.getBoolean("colorized"));
      }
      if (notification.containsKey("contentInfo")) {
        nb = nb.setContentInfo(notification.getString("contentInfo"));
      }
      if (notification.containsKey("defaults")) {
        // TODO: Bitwise ?
        nb = nb.setDefaults()
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
      if (notification.containsKey("publicVersion")) {
        // TODO: Build notification
        nb = nb.setPublicVersion();
      }
      if (notification.containsKey("remoteInputHistory")) {
        // TODO: Build notification
        nb = nb.setRemoteInputHistory(notification.getStringArray("remoteInputHistory"));
      }
      if (notification.containsKey("shortcutId")) {
        nb = nb.setShortcutId(notification.getString("shortcutId"));
      }
      if (notification.containsKey("showWhen")) {
        nb = nb.setShowWhen(notification.getBoolean("showWhen"));
      }
      if (notification.containsKey("smallIcon")) {
        nb = nb.setSmallIcon(notification.getInt("smallIcon"));
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
      // TODO actions: Action[]; // icon, title, ??pendingIntent??, allowGeneratedReplies, extender, extras, remoteinput (ugh)
      // TODO: style: Style; // Need to figure out if this can work

      //icon
      String smallIcon = bundle.getString("icon", "ic_launcher");
      int smallIconResId = res.getIdentifier(smallIcon, "mipmap", packageName);
      notification.setSmallIcon(smallIconResId);

      //big text
      String bigText = bundle.getString("big_text");
      if(bigText != null){
        notification.setStyle(new NotificationCompat.BigTextStyle().bigText(bigText));
      }

      //sound
      String soundName = bundle.getString("sound", "default");
      if (!soundName.equalsIgnoreCase("default")) {
        int soundResourceId = res.getIdentifier(soundName, "raw", packageName);
        if(soundResourceId == 0){
          soundName = soundName.substring(0, soundName.lastIndexOf('.'));
          soundResourceId = res.getIdentifier(soundName, "raw", packageName);
        }
        notification.setSound(Uri.parse("android.resource://" + packageName + "/" + soundResourceId));
      }

      //color
      if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        String color = bundle.getString("color");
        if (color != null) {
          notification.setColor(Color.parseColor(color));
        }
      }

      //lights
      if (bundle.getBoolean("lights")) {
        notification.setDefaults(NotificationCompat.DEFAULT_LIGHTS);
      }

      Log.d(TAG, "broadcast intent before showing notification");
      Intent i = new Intent("io.invertase.firebase.messaging.ReceiveLocalNotification");
      i.putExtras(bundle);
      mContext.sendOrderedBroadcast(i, null);

      if(!mIsForeground || bundle.getBoolean("show_in_foreground")){
        Intent intent = new Intent(mContext, intentClass);
        intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtras(bundle);
        intent.setAction(bundle.getString("click_action"));

        int notificationID = bundle.containsKey("id") ? bundle.getString("id", "").hashCode() : (int) System.currentTimeMillis();
        PendingIntent pendingIntent = PendingIntent.getActivity(mContext, notificationID, intent,
          PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationManager notificationManager =
          (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);

        notification.setContentIntent(pendingIntent);

        Notification info = notification.build();

        if (bundle.containsKey("tag")) {
          String tag = bundle.getString("tag");
          notificationManager.notify(tag, notificationID, info);
        } else {
          notificationManager.notify(notificationID, info);
        }
      }
      //clear out one time scheduled notification once fired
      if(!bundle.containsKey("repeat_interval") && bundle.containsKey("fire_date")) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.remove(bundle.getString("id"));
        editor.apply();
      }
    } catch (Exception e) {
      Log.e(TAG, "failed to send local notification", e);
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

  public void scheduleNotification(ReadableMap notification, ReadableMap schedule, Promise promise) {
    Bundle notificationBundle = Arguments.toBundle(notification);

    scheduleNotification(notificationBundle, promise);
  }

  private void scheduleNotification(Bundle notification, Promise promise) {
    // TODO
    String notificationId = notification.getString("notificationId");
    if (!notification.containsKey("notificationId")) {
      if (promise != null) {
        promise.reject("notification/schedule_notification_error", "Missing notificationId");
      } else {
        Log.e(TAG, "Missing notificationId");
      }
      return;
    }

    // TODO: Schedule check
    if (!notification.hasKey("schedule")) {

      return;
    }
    /*
    Long fireDate = Math.round(bundle.getDouble("fire_date"));

    if (fireDate == 0) {
      Log.e(TAG, "failed to schedule notification because fire date is missing");
      return;
    }*/


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
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, notificationId.hashCode(), notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    // TODO: Scheduling
    Long interval = null;
    switch (notification.getString("repeat_interval", "")) {
      case "minute":
        interval = (long) 60000;
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
    }

    if(interval != null){
      alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, fireDate, interval, pendingIntent);
    } else if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT){
      alarmManager.setExact(AlarmManager.RTC_WAKEUP, fireDate, pendingIntent);
    }else {
      alarmManager.set(AlarmManager.RTC_WAKEUP, fireDate, pendingIntent);
    }
  }

  private void cancelAlarm(String notificationId) {
    Intent notificationIntent = new Intent(context, RNFirebaseNotificationManager.class);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(context, notificationId.hashCode(), notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);
    alarmManager.cancel(pendingIntent);
  }

  private Bitmap getBitmap(String image) {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return getBitmapFromUrl(image);
    } else {
      int largeIconResId = res.getIdentifier(image, "mipmap", packageName);
      return BitmapFactory.decodeResource(res, largeIconResId);
    }
  }

  private Bitmap getBitmapFromUrl(String imageUrl) {
    try {
      HttpURLConnection connection = (HttpURLConnection) new URL(imageUrl).openConnection();
      connection.setDoInput(true);
      connection.connect();
      return BitmapFactory.decodeStream(connection.getInputStream());
    } catch (IOException e) {
      Log.e(TAG, e.getMessage());
      return null;
    }
  }
}
