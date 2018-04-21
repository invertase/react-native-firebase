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
    try {
      Class intentClass = getMainActivityClass();
      if (intentClass == null) {
        if (promise != null) {
          promise.reject("notification/display_notification_error", "Could not find main activity class");
        }
        return;
      }

      Bundle android = notification.getBundle("android");

      String channelId = android.getString("channelId");
      String notificationId = notification.getString("notificationId");

      NotificationCompat.Builder nb;
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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
        Uri sound = getSound(notification.getString("sound"));
        nb = nb.setSound(sound);
      }
      if (notification.containsKey("subtitle")) {
        nb = nb.setSubText(notification.getString("subtitle"));
      }
      if (notification.containsKey("title")) {
        nb = nb.setContentTitle(notification.getString("title"));
      }

      if (android.containsKey("autoCancel")) {
        nb = nb.setAutoCancel(android.getBoolean("autoCancel"));
      }
      if (android.containsKey("badgeIconType")) {
        Double badgeIconType = android.getDouble("badgeIconType");
        nb = nb.setBadgeIconType(badgeIconType.intValue());
      }
      if (android.containsKey("bigPicture")) {
        Bundle bigPicture = android.getBundle("bigPicture");

        NotificationCompat.BigPictureStyle bp = new NotificationCompat.BigPictureStyle();
        Bitmap picture = getBitmap(bigPicture.getString("picture"));
        if (picture != null) {
          bp = bp.bigPicture(picture);
        }
        if (bigPicture.containsKey("largeIcon")) {
          Bitmap largeIcon = getBitmap(bigPicture.getString("largeIcon"));
          if (largeIcon != null) {
            bp = bp.bigLargeIcon(largeIcon);
          }
        }
        if (bigPicture.containsKey("contentTitle")) {
          bp = bp.setBigContentTitle(bigPicture.getString("contentTitle"));
        }
        if (bigPicture.containsKey("summaryText")) {
          bp = bp.setSummaryText(bigPicture.getString("summaryText"));
        }
        nb = nb.setStyle(bp);
      }
      if (android.containsKey("bigText")) {
        Bundle bigText = android.getBundle("bigText");

        NotificationCompat.BigTextStyle bt = new NotificationCompat.BigTextStyle();
        bt.bigText(bigText.getString("text"));
        if (bigText.containsKey("contentTitle")) {
          bt = bt.setBigContentTitle(bigText.getString("contentTitle"));
        }
        if (bigText.containsKey("summaryText")) {
          bt = bt.setSummaryText(bigText.getString("summaryText"));
        }
        nb = nb.setStyle(bt);
      }
      if (android.containsKey("category")) {
        nb = nb.setCategory(android.getString("category"));
      }
      if (android.containsKey("color")) {
        String color = android.getString("color");
        nb = nb.setColor(Color.parseColor(color));
      }
      if (android.containsKey("colorized")) {
        nb = nb.setColorized(android.getBoolean("colorized"));
      }
      if (android.containsKey("contentInfo")) {
        nb = nb.setContentInfo(android.getString("contentInfo"));
      }
      if (notification.containsKey("defaults")) {
        double[] defaultsArray = android.getDoubleArray("defaults");
        int defaults = 0;
        for (Double d : defaultsArray) {
          defaults |= d.intValue();
        }
        nb = nb.setDefaults(defaults);
      }
      if (android.containsKey("group")) {
        nb = nb.setGroup(android.getString("group"));
      }
      if (android.containsKey("groupAlertBehaviour")) {
        Double groupAlertBehaviour = android.getDouble("groupAlertBehaviour");
        nb = nb.setGroupAlertBehavior(groupAlertBehaviour.intValue());
      }
      if (android.containsKey("groupSummary")) {
        nb = nb.setGroupSummary(android.getBoolean("groupSummary"));
      }
      if (android.containsKey("largeIcon")) {
        Bitmap largeIcon = getBitmap(android.getString("largeIcon"));
        if (largeIcon != null) {
          nb = nb.setLargeIcon(largeIcon);
        }
      }
      if (android.containsKey("lights")) {
        Bundle lights = android.getBundle("lights");
        Double argb = lights.getDouble("argb");
        Double onMs = lights.getDouble("onMs");
        Double offMs = lights.getDouble("offMs");
        nb = nb.setLights(argb.intValue(), onMs.intValue(), offMs.intValue());
      }
      if (android.containsKey("localOnly")) {
        nb = nb.setLocalOnly(android.getBoolean("localOnly"));
      }

      if (android.containsKey("number")) {
        Double number = android.getDouble("number");
        nb = nb.setNumber(number.intValue());
      }
      if (android.containsKey("ongoing")) {
        nb = nb.setOngoing(android.getBoolean("ongoing"));
      }
      if (android.containsKey("onlyAlertOnce")) {
        nb = nb.setOngoing(android.getBoolean("onlyAlertOnce"));
      }
      if (android.containsKey("people")) {
        List<String> people = android.getStringArrayList("people");
        if (people != null) {
          for (String person : people) {
            nb = nb.addPerson(person);
          }
        }
      }
      if (android.containsKey("priority")) {
        Double priority = android.getDouble("priority");
        nb = nb.setPriority(priority.intValue());
      }
      if (android.containsKey("progress")) {
        Bundle progress = android.getBundle("lights");
        Double max = progress.getDouble("max");
        Double progressI = progress.getDouble("progress");
        nb = nb.setProgress(max.intValue(), progressI.intValue(), progress.getBoolean("indeterminate"));
      }
      // TODO: Public version of notification
      /* if (android.containsKey("publicVersion")) {
        nb = nb.setPublicVersion();
      } */
      if (android.containsKey("remoteInputHistory")) {
        nb = nb.setRemoteInputHistory(android.getStringArray("remoteInputHistory"));
      }
      if (android.containsKey("shortcutId")) {
        nb = nb.setShortcutId(android.getString("shortcutId"));
      }
      if (android.containsKey("showWhen")) {
        nb = nb.setShowWhen(android.getBoolean("showWhen"));
      }
      if (android.containsKey("smallIcon")) {
        Bundle smallIcon = android.getBundle("smallIcon");
        int smallIconResourceId = getIcon(smallIcon.getString("icon"));

        if (smallIconResourceId != 0) {
          if (smallIcon.containsKey("level")) {
            Double level = smallIcon.getDouble("level");
            nb = nb.setSmallIcon(smallIconResourceId, level.intValue());
          } else {
            nb = nb.setSmallIcon(smallIconResourceId);
          }
        }
      }
      if (android.containsKey("sortKey")) {
        nb = nb.setSortKey(android.getString("sortKey"));
      }
      if (android.containsKey("ticker")) {
        nb = nb.setTicker(android.getString("ticker"));
      }
      if (android.containsKey("timeoutAfter")) {
        Double timeoutAfter = android.getDouble("timeoutAfter");
        nb = nb.setTimeoutAfter(timeoutAfter.longValue());
      }
      if (android.containsKey("usesChronometer")) {
        nb = nb.setUsesChronometer(android.getBoolean("usesChronometer"));
      }
      if (android.containsKey("vibrate")) {
        ArrayList<Integer> vibrate = android.getIntegerArrayList("vibrate");
        if(vibrate != null) {
          long[] vibrateArray = new long[vibrate.size()];
          for (int i = 0; i < vibrate.size(); i++) {
            vibrateArray[i] = vibrate.get(i).longValue();
          }
          nb = nb.setVibrate(vibrateArray);
        }
      }
      if (android.containsKey("visibility")) {
        Double visibility = android.getDouble("visibility");
        nb = nb.setVisibility(visibility.intValue());
      }
      if (android.containsKey("when")) {
        Double when = android.getDouble("when");
        nb = nb.setWhen(when.longValue());
      }

      // Build any actions
      if (android.containsKey("actions")) {
        List<Bundle> actions = (List) android.getSerializable("actions");
        for (Bundle a : actions) {
          NotificationCompat.Action action = createAction(a, intentClass, notification);
          nb = nb.addAction(action);
        }
      }

      // Create the notification intent
      PendingIntent contentIntent = createIntent(intentClass, notification, android.getString("clickAction"));
      nb = nb.setContentIntent(contentIntent);

      // Build the notification and send it
      Notification builtNotification = nb.build();
      notificationManager.notify(notificationId.hashCode(), builtNotification);

      if (reactContext != null) {
        Utils.sendEvent(reactContext, "notifications_notification_displayed", Arguments.fromBundle(notification));
      }
    } catch (Exception e) {
      Log.e(TAG, "Failed to send notification", e);
      if (promise != null) {
        promise.reject("notification/display_notification_error", "Could not send notification", e);
      }
    }
  }

  private NotificationCompat.Action createAction(Bundle action, Class intentClass, Bundle notification) {
    String actionKey = action.getString("action");
    PendingIntent actionIntent = createIntent(intentClass, notification, actionKey);

    int icon = getIcon(action.getString("icon"));
    String title = action.getString("title");

    NotificationCompat.Action.Builder ab = new NotificationCompat.Action.Builder(icon, title, actionIntent);

    if (action.containsKey("allowGeneratedReplies")) {
      ab = ab.setAllowGeneratedReplies(action.getBoolean("allowGeneratedReplies"));
    }
    if (action.containsKey("remoteInputs")) {
      List<Bundle> remoteInputs = (List) action.getSerializable("remoteInputs");
      for (Bundle ri : remoteInputs) {
        RemoteInput remoteInput = createRemoteInput(ri);
        ab = ab.addRemoteInput(remoteInput);
      }
    }
    // TODO: SemanticAction and ShowsUserInterface only available on v28?
    // if (action.containsKey("semanticAction")) {
    //   Double semanticAction = action.getDouble("semanticAction");
    //   ab = ab.setSemanticAction(semanticAction.intValue());
    // }
    // if (action.containsKey("showsUserInterface")) {
    //   ab = ab.setShowsUserInterface(action.getBoolean("showsUserInterface"));
    // }

    return ab.build();
  }

  private PendingIntent createIntent(Class intentClass, Bundle notification, String action) {
    Intent intent = new Intent(context, intentClass);
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
    intent.putExtras(notification);

    if (action != null) {
      intent.setAction(action);
    }

    String notificationId = notification.getString("notificationId");

    return PendingIntent.getActivity(context, notificationId.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT);
  }

  private RemoteInput createRemoteInput(Bundle remoteInput) {
    String resultKey = remoteInput.getString("resultKey");

    RemoteInput.Builder rb = new RemoteInput.Builder(resultKey);

    if (remoteInput.containsKey("allowedDataTypes")) {
      List<Bundle> allowedDataTypes = (List) remoteInput.getSerializable("allowedDataTypes");
      for (Bundle adt : allowedDataTypes) {
        rb.setAllowDataType(adt.getString("mimeType"), adt.getBoolean("allow"));
      }
    }
    if (remoteInput.containsKey("allowFreeFormInput")) {
      rb.setAllowFreeFormInput(remoteInput.getBoolean("allowFreeFormInput"));
    }
    if (remoteInput.containsKey("choices")) {
      List<String> choices = remoteInput.getStringArrayList("choices");
      rb.setChoices(choices.toArray(new String[choices.size()]));
    }
    if (remoteInput.containsKey("label")) {
      rb.setLabel(remoteInput.getString("label"));
    }

    return rb.build();
  }

  private Bitmap getBitmap(String image) {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return getBitmapFromUrl(image);
    } else if (image.startsWith("file://")) {
      return BitmapFactory.decodeFile(image.replace("file://", ""));
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

  private int getIcon(String icon) {
    int smallIconResourceId = getResourceId("mipmap", icon);
    if (smallIconResourceId == 0) {
      smallIconResourceId = getResourceId("drawable", icon);
    }
    return smallIconResourceId;
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

  private Uri getSound(String sound) {
    if (sound.contains("://")) {
      return Uri.parse(sound);
    } else if (sound.equalsIgnoreCase("default")) {
      return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
    } else {
      int soundResourceId = getResourceId("raw", sound);
      if (soundResourceId == 0) {
        soundResourceId = getResourceId("raw", sound.substring(0, sound.lastIndexOf('.')));
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
        Uri sound = getSound(channelMap.getString("sound"));
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

    Double fireDate = schedule.getDouble("fireDate");

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
        promise.reject("notification/schedule_notification_error", "Invalid interval");
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

    promise.resolve(null);
  }
}
