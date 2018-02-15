package io.invertase.firebase.notifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;

import io.invertase.firebase.Utils;

public class RNFirebaseNotifications extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private static final String TAG = "RNFirebaseNotifications";

  private RNFirebaseNotificationManager notificationManager;
  public RNFirebaseNotifications(ReactApplicationContext context) {
    super(context);
    notificationManager = new RNFirebaseNotificationManager(context.getApplicationContext());
    context.addLifecycleEventListener(this);

    LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(context);

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
  public void scheduleNotification(ReadableMap notification, Promise promise) {
    notificationManager.scheduleNotification(notification, promise);
  }

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

  private WritableMap parseNotificationBundle(Bundle notification) {
    return Arguments.makeNativeMap(notification);
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
