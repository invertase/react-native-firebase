package io.invertase.firebase.notifications;

import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;

import java.util.ArrayList;

public class RNFirebaseNotifications extends ReactContextBaseJavaModule {
  private RNFirebaseNotificationManager notificationManager;
  public RNFirebaseNotifications(ReactApplicationContext context) {
    super(context);
    notificationManager = new RNFirebaseNotificationManager(context.getApplicationContext());
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
  public void getInitialNotification(Promise promise) {
    // TODO
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
  public void scheduleNotification(ReadableMap notification, ReadableMap schedule, Promise promise) {
    notificationManager.scheduleNotification(notification, schedule, promise);
  }
}
