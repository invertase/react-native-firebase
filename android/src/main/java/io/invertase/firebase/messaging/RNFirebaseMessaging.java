package io.invertase.firebase.messaging;

import android.app.Activity;
import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.Set;

public class RNFirebaseMessaging extends ReactContextBaseJavaModule implements LifecycleEventListener, ActivityEventListener {
  private final static String TAG = RNFirebaseMessaging.class.getCanonicalName();
  private RNFirebaseLocalMessagingHelper mRNFirebaseLocalMessagingHelper;
  private BadgeHelper mBadgeHelper;

  public RNFirebaseMessaging(ReactApplicationContext reactContext) {
    super(reactContext);
    mRNFirebaseLocalMessagingHelper = new RNFirebaseLocalMessagingHelper((Application) reactContext.getApplicationContext());
    mBadgeHelper = new BadgeHelper(reactContext.getApplicationContext());
    getReactApplicationContext().addLifecycleEventListener(this);
    getReactApplicationContext().addActivityEventListener(this);
    registerTokenRefreshHandler();
    registerMessageHandler();
    registerLocalMessageHandler();
  }

  @Override
  public String getName() {
    return "RNFirebaseMessaging";
  }

  @ReactMethod
  public void getInitialNotification(Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.resolve(null);
      return;
    }
    promise.resolve(parseIntent(getCurrentActivity().getIntent()));
  }

  @ReactMethod
  public void requestPermissions() {
  }

  @ReactMethod
  public void getToken(Promise promise) {
    Log.d(TAG, "Firebase token: " + FirebaseInstanceId.getInstance().getToken());
    promise.resolve(FirebaseInstanceId.getInstance().getToken());
  }

  @ReactMethod
  public void deleteInstanceId(Promise promise){
    try {
      Log.d(TAG, "Deleting instance id");
      FirebaseInstanceId.getInstance().deleteInstanceId();
      promise.resolve(null);
    } catch (IOException e) {
      Log.e(TAG, e.getMessage());
      promise.reject(null, e.getMessage());
    }
  }

  @ReactMethod
  public void createLocalNotification(ReadableMap details) {
    Bundle bundle = Arguments.toBundle(details);
    mRNFirebaseLocalMessagingHelper.sendNotification(bundle);
  }

  @ReactMethod
  public void scheduleLocalNotification(ReadableMap details) {
    Bundle bundle = Arguments.toBundle(details);
    mRNFirebaseLocalMessagingHelper.sendNotificationScheduled(bundle);
  }

  @ReactMethod
  public void cancelLocalNotification(String notificationID) {
    mRNFirebaseLocalMessagingHelper.cancelLocalNotification(notificationID);
  }

  @ReactMethod
  public void cancelAllLocalNotifications() {
    mRNFirebaseLocalMessagingHelper.cancelAllLocalNotifications();
  }

  @ReactMethod
  public void removeDeliveredNotification(String notificationID) {
    mRNFirebaseLocalMessagingHelper.removeDeliveredNotification(notificationID);
  }

  @ReactMethod
  public void removeAllDeliveredNotifications() {
    mRNFirebaseLocalMessagingHelper.removeAllDeliveredNotifications();
  }

  @ReactMethod
  public void subscribeToTopic(String topic) {
    FirebaseMessaging.getInstance().subscribeToTopic(topic);
  }

  @ReactMethod
  public void unsubscribeFromTopic(String topic) {
    FirebaseMessaging.getInstance().unsubscribeFromTopic(topic);
  }

  @ReactMethod
  public void getScheduledLocalNotifications(Promise promise) {
    ArrayList<Bundle> bundles = mRNFirebaseLocalMessagingHelper.getScheduledLocalNotifications();
    WritableArray array = Arguments.createArray();
    for (Bundle bundle : bundles) {
      array.pushMap(Arguments.fromBundle(bundle));
    }
    promise.resolve(array);
  }

  @ReactMethod
  public void setBadgeNumber(int badgeNumber) {
    mBadgeHelper.setBadgeCount(badgeNumber);
  }

  @ReactMethod
  public void getBadgeNumber(Promise promise) {
    promise.resolve(mBadgeHelper.getBadgeCount());
  }

  private void registerTokenRefreshHandler() {
    IntentFilter intentFilter = new IntentFilter("io.invertase.firebase.messaging.FCMRefreshToken");
    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (getReactApplicationContext().hasActiveCatalystInstance()) {
          String token = intent.getStringExtra("token");
          Utils.sendEvent(getReactApplicationContext(), "messaging_token_refreshed", token);
        }
      }
    }, intentFilter);
  }

  @ReactMethod
  public void send(ReadableMap remoteMessage) {
    FirebaseMessaging fm = FirebaseMessaging.getInstance();
    RemoteMessage.Builder message = new RemoteMessage.Builder(remoteMessage.getString("sender"));

    message.setTtl(remoteMessage.getInt("ttl"));
    message.setMessageId(remoteMessage.getString("id"));
    message.setMessageType(remoteMessage.getString("type"));

    if (remoteMessage.hasKey("collapseKey")) {
      message.setCollapseKey(remoteMessage.getString("collapseKey"));
    }

    // get data keys and values and add to builder
    // js side ensures all data values are strings
    // so no need to check types
    ReadableMap data = remoteMessage.getMap("data");
    ReadableMapKeySetIterator iterator = data.keySetIterator();
    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      String value = data.getString(key);
      message.addData(key, value);
    }

    fm.send(message.build());
  }

  private void registerMessageHandler() {
    IntentFilter intentFilter = new IntentFilter("io.invertase.firebase.messaging.ReceiveNotification");

    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (getReactApplicationContext().hasActiveCatalystInstance()) {
          RemoteMessage message = intent.getParcelableExtra("data");
          WritableMap params = Arguments.createMap();
          WritableMap fcmData = Arguments.createMap();

          if (message.getNotification() != null) {
            Notification notification = message.getNotification();
            fcmData.putString("title", notification.getTitle());
            fcmData.putString("body", notification.getBody());
            fcmData.putString("color", notification.getColor());
            fcmData.putString("icon", notification.getIcon());
            fcmData.putString("tag", notification.getTag());
            fcmData.putString("action", notification.getClickAction());
          }
          params.putMap("fcm", fcmData);

          if (message.getData() != null) {
            Map<String, String> data = message.getData();
            Set<String> keysIterator = data.keySet();
            for (String key : keysIterator) {
              params.putString(key, data.get(key));
            }
          }
          Utils.sendEvent(getReactApplicationContext(), "messaging_notification_received", params);

        }
      }
    }, intentFilter);
  }

  private void registerLocalMessageHandler() {
    IntentFilter intentFilter = new IntentFilter("io.invertase.firebase.messaging.ReceiveLocalNotification");

    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (getReactApplicationContext().hasActiveCatalystInstance()) {
          Utils.sendEvent(getReactApplicationContext(), "messaging_notification_received", Arguments.fromBundle(intent.getExtras()));
        }
      }
    }, intentFilter);
  }

  private WritableMap parseIntent(Intent intent) {
    WritableMap params;
    Bundle extras = intent.getExtras();
    if (extras != null) {
      try {
        params = Arguments.fromBundle(extras);
      } catch (Exception e) {
        Log.e(TAG, e.getMessage());
        params = Arguments.createMap();
      }
    } else {
      params = Arguments.createMap();
    }
    WritableMap fcm = Arguments.createMap();
    fcm.putString("action", intent.getAction());
    params.putMap("fcm", fcm);

    params.putBoolean("opened_from_tray", true);
    return params;
  }

  @Override
  public void onHostResume() {
    mRNFirebaseLocalMessagingHelper.setApplicationForeground(true);
  }

  @Override
  public void onHostPause() {
    mRNFirebaseLocalMessagingHelper.setApplicationForeground(false);
  }

  @Override
  public void onHostDestroy() {

  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    // todo hmm?
  }

  @Override
  public void onNewIntent(Intent intent) {
    // todo hmm?
    Utils.sendEvent(getReactApplicationContext(), "messaging_notification_received", parseIntent(intent));
  }
}
