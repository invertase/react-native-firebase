package io.invertase.firebase.messaging;

import android.app.AlarmManager;
import android.app.Application;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
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
import android.content.SharedPreferences;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.HttpURLConnection;

public class RNFirebaseLocalMessagingHelper {
  private static final long DEFAULT_VIBRATION = 300L;
  private static final String TAG = RNFirebaseLocalMessagingHelper.class.getSimpleName();
  private final static String PREFERENCES_KEY = "ReactNativeSystemNotification";
  private static boolean mIsForeground = false; //this is a hack

  private Context mContext;
  private SharedPreferences sharedPreferences = null;

  public RNFirebaseLocalMessagingHelper(Application context) {
    mContext = context;
    sharedPreferences = mContext.getSharedPreferences(PREFERENCES_KEY, Context.MODE_PRIVATE);
  }

  public void sendNotification(Bundle bundle) {
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

      String title = bundle.getString("title");
      if (title == null) {
        ApplicationInfo appInfo = mContext.getApplicationInfo();
        title = mContext.getPackageManager().getApplicationLabel(appInfo).toString();
      }

      NotificationCompat.Builder notification = new NotificationCompat.Builder(mContext)
        .setContentTitle(title)
        .setContentText(bundle.getString("body"))
        .setTicker(bundle.getString("ticker"))
        .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
        .setAutoCancel(bundle.getBoolean("auto_cancel", true))
        .setNumber(bundle.getInt("number"))
        .setSubText(bundle.getString("sub_text"))
        .setGroup(bundle.getString("group"))
        .setVibrate(new long[]{0, DEFAULT_VIBRATION})
        .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
        .setExtras(bundle.getBundle("data"));

      //priority
      String priority = bundle.getString("priority", "");
      switch(priority) {
        case "min":
          notification.setPriority(NotificationCompat.PRIORITY_MIN);
          break;
        case "high":
          notification.setPriority(NotificationCompat.PRIORITY_HIGH);
          break;
        case "max":
          notification.setPriority(NotificationCompat.PRIORITY_MAX);
          break;
        default:
          notification.setPriority(NotificationCompat.PRIORITY_DEFAULT);
      }

      //icon
      String smallIcon = bundle.getString("icon", "ic_launcher");
      int smallIconResId = res.getIdentifier(smallIcon, "mipmap", packageName);
      notification.setSmallIcon(smallIconResId);

      //large icon
      String largeIcon = bundle.getString("large_icon");
      if(largeIcon != null && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP){
        if (largeIcon.startsWith("http://") || largeIcon.startsWith("https://")) {
          Bitmap bitmap = getBitmapFromURL(largeIcon);
          notification.setLargeIcon(bitmap);
        } else {
          int largeIconResId = res.getIdentifier(largeIcon, "mipmap", packageName);
          Bitmap largeIconBitmap = BitmapFactory.decodeResource(res, largeIconResId);

          if (largeIconResId != 0) {
            notification.setLargeIcon(largeIconBitmap);
          }
        }
      }

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
        notification.setCategory(NotificationCompat.CATEGORY_CALL);

        String color = bundle.getString("color");
        if (color != null) {
          notification.setColor(Color.parseColor(color));
        }
      }

      //vibrate
      if(bundle.containsKey("vibrate")){
        long vibrate = bundle.getLong("vibrate", Math.round(bundle.getDouble("vibrate", bundle.getInt("vibrate"))));
        if(vibrate > 0){
          notification.setVibrate(new long[]{0, vibrate});
        }else{
          notification.setVibrate(null);
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

  public void sendNotificationScheduled(Bundle bundle) {
    Class intentClass = getMainActivityClass();
    if (intentClass == null) {
      return;
    }

    String notificationId = bundle.getString("id");
    if(notificationId == null){
      Log.e(TAG, "failed to schedule notification because id is missing");
      return;
    }

    Long fireDate = Math.round(bundle.getDouble("fire_date"));

    if (fireDate == 0) {
      Log.e(TAG, "failed to schedule notification because fire date is missing");
      return;
    }

    Intent notificationIntent = new Intent(mContext, RNFirebaseLocalMessagingPublisher.class);
    notificationIntent.putExtras(bundle);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(mContext, notificationId.hashCode(), notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    Long interval = null;
    switch (bundle.getString("repeat_interval", "")) {
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
      getAlarmManager().setRepeating(AlarmManager.RTC_WAKEUP, fireDate, interval, pendingIntent);
    } else if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT){
      getAlarmManager().setExact(AlarmManager.RTC_WAKEUP, fireDate, pendingIntent);
    }else {
      getAlarmManager().set(AlarmManager.RTC_WAKEUP, fireDate, pendingIntent);
    }

    //store intent
    SharedPreferences.Editor editor = sharedPreferences.edit();
    try {
      JSONObject json = BundleJSONConverter.convertToJSON(bundle);
      editor.putString(notificationId, json.toString());
      editor.apply();
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  public void cancelLocalNotification(String notificationId) {
    cancelAlarm(notificationId);
    SharedPreferences.Editor editor = sharedPreferences.edit();
    editor.remove(notificationId);
    editor.apply();
  }

  public void cancelAllLocalNotifications() {
    java.util.Map<String, ?> keyMap = sharedPreferences.getAll();
    SharedPreferences.Editor editor = sharedPreferences.edit();
    for(java.util.Map.Entry<String, ?> entry:keyMap.entrySet()){
      cancelAlarm(entry.getKey());
    }
    editor.clear();
    editor.apply();
  }

  public void removeDeliveredNotification(String notificationId){
    NotificationManager notificationManager = (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.cancel(notificationId.hashCode());
  }

  public void removeAllDeliveredNotifications(){
    NotificationManager notificationManager = (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.cancelAll();
  }

  public ArrayList<Bundle> getScheduledLocalNotifications(){
    ArrayList<Bundle> array = new ArrayList<Bundle>();
    java.util.Map<String, ?> keyMap = sharedPreferences.getAll();
    for(java.util.Map.Entry<String, ?> entry:keyMap.entrySet()){
      try {
        JSONObject json = new JSONObject((String)entry.getValue());
        Bundle bundle = BundleJSONConverter.convertToBundle(json);
        array.add(bundle);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return array;
  }

  public void setApplicationForeground(boolean foreground){
    mIsForeground = foreground;
  }

  private Class getMainActivityClass() {
    String packageName = mContext.getPackageName();
    Intent launchIntent = mContext.getPackageManager().getLaunchIntentForPackage(packageName);
    String className = launchIntent.getComponent().getClassName();
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }

  private AlarmManager getAlarmManager() {
    return (AlarmManager) mContext.getSystemService(Context.ALARM_SERVICE);
  }

  private void cancelAlarm(String notificationId) {
    Intent notificationIntent = new Intent(mContext, RNFirebaseLocalMessagingPublisher.class);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(mContext, notificationId.hashCode(), notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);
    getAlarmManager().cancel(pendingIntent);
  }

  private Bitmap getBitmapFromURL(String strURL) {
    try {
      URL url = new URL(strURL);
      HttpURLConnection connection = (HttpURLConnection) url.openConnection();
      connection.setDoInput(true);
      connection.connect();
      InputStream input = connection.getInputStream();
      return BitmapFactory.decodeStream(input);
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}
