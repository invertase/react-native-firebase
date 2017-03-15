package io.invertase.firebase.messaging;

import java.util.Map;

import android.content.Context;
import android.content.IntentFilter;
import android.content.Intent;
import android.content.BroadcastReceiver;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;

import io.invertase.firebase.Utils;

public class RNFirebaseMessaging extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseMessaging";
  private static final String EVENT_NAME_TOKEN = "RNFirebaseRefreshToken";
  private static final String EVENT_NAME_NOTIFICATION = "RNFirebaseReceiveNotification";
  private static final String EVENT_NAME_SEND = "RNFirebaseUpstreamSend";

  public static final String INTENT_NAME_TOKEN = "io.invertase.firebase.refreshToken";
  public static final String INTENT_NAME_NOTIFICATION = "io.invertase.firebase.ReceiveNotification";
  public static final String INTENT_NAME_SEND = "io.invertase.firebase.Upstream";

  private IntentFilter mRefreshTokenIntentFilter;
  private IntentFilter mReceiveNotificationIntentFilter;
  private IntentFilter mReceiveSendIntentFilter;
  private BroadcastReceiver mBroadcastReceiver;

  public RNFirebaseMessaging(ReactApplicationContext reactContext) {
    super(reactContext);
    mRefreshTokenIntentFilter = new IntentFilter(INTENT_NAME_TOKEN);
    mReceiveNotificationIntentFilter = new IntentFilter(INTENT_NAME_NOTIFICATION);
    mReceiveSendIntentFilter = new IntentFilter(INTENT_NAME_SEND);
    initRefreshTokenHandler();
    initMessageHandler();
    initSendHandler();
    Log.d(TAG, "New instance");
  }

  @Override
  public String getName() {
    return TAG;
  }

  private void initMessageHandler() {
    Log.d(TAG, "RNFirebase initMessageHandler called");

    if (mBroadcastReceiver == null) {
      mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
          RemoteMessage remoteMessage = intent.getParcelableExtra("data");
          Log.d(TAG, "Firebase onReceive: " + remoteMessage);
          WritableMap params = Arguments.createMap();

          params.putNull("data");
          params.putNull("notification");
          params.putString("id", remoteMessage.getMessageId());
          params.putString("messageId", remoteMessage.getMessageId());


          if (remoteMessage.getData().size() != 0) {
            WritableMap dataMap = Arguments.createMap();
            Map<String, String> data = remoteMessage.getData();

            for (String key : data.keySet()) {
              dataMap.putString(key, data.get(key));
            }

            params.putMap("data", dataMap);
          }


          if (remoteMessage.getNotification() != null) {
            WritableMap notificationMap = Arguments.createMap();
            RemoteMessage.Notification notification = remoteMessage.getNotification();
            notificationMap.putString("title", notification.getTitle());
            notificationMap.putString("body", notification.getBody());
            notificationMap.putString("icon", notification.getIcon());
            notificationMap.putString("sound", notification.getSound());
            notificationMap.putString("tag", notification.getTag());
            params.putMap("notification", notificationMap);
          }

          ReactContext ctx = getReactApplicationContext();
          Utils.sendEvent(ctx, EVENT_NAME_NOTIFICATION, params);
        }
      };

    }
    getReactApplicationContext().registerReceiver(mBroadcastReceiver, mReceiveNotificationIntentFilter);
  }

  /**
   *
   */
  private void initRefreshTokenHandler() {
    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        WritableMap params = Arguments.createMap();
        params.putString("token", intent.getStringExtra("token"));
        ReactContext ctx = getReactApplicationContext();
        Log.d(TAG, "initRefreshTokenHandler received event " + EVENT_NAME_TOKEN);
        Utils.sendEvent(ctx, EVENT_NAME_TOKEN, params);
      }

      ;
    }, mRefreshTokenIntentFilter);
  }

  @ReactMethod
  public void subscribeToTopic(String topic, final Callback callback) {
    try {
      FirebaseMessaging.getInstance().subscribeToTopic(topic);
      callback.invoke(null, topic);
    } catch (Exception e) {
      e.printStackTrace();
      Log.d(TAG, "Firebase token: " + e);
      WritableMap error = Arguments.createMap();
      error.putString("message", e.getMessage());
      callback.invoke(error);

    }
  }

  @ReactMethod
  public void getToken(final Promise promise) {
    try {
      String token = FirebaseInstanceId.getInstance().getToken();
      Log.d(TAG, "Firebase token: " + token);
      promise.resolve(token);
    } catch (Exception e) {
      promise.reject("messaging/unknown", e.getMessage(), e);
    }
  }

  @ReactMethod
  public void unsubscribeFromTopic(String topic, final Callback callback) {
    try {
      FirebaseMessaging.getInstance().unsubscribeFromTopic(topic);
      callback.invoke(null, topic);
    } catch (Exception e) {
      WritableMap error = Arguments.createMap();
      error.putString("message", e.getMessage());
      callback.invoke(error);
    }
  }

  // String senderId, String messageId, String messageType,
  @ReactMethod
  public void send(ReadableMap params, final Callback callback) {
    ReadableMap data = params.getMap("data");
    FirebaseMessaging fm = FirebaseMessaging.getInstance();
    RemoteMessage.Builder remoteMessage = new RemoteMessage.Builder(params.getString("sender"));

    remoteMessage.setMessageId(params.getString("id"));
    remoteMessage.setMessageType(params.getString("type"));

    if (params.hasKey("ttl")) {
      remoteMessage.setTtl(params.getInt("ttl"));
    }

    if (params.hasKey("collapseKey")) {
      remoteMessage.setCollapseKey(params.getString("collapseKey"));
    }

    ReadableMapKeySetIterator iterator = data.keySetIterator();

    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      ReadableType type = data.getType(key);
      if (type == ReadableType.String) {
        remoteMessage.addData(key, data.getString(key));
      }
    }

    try {
      fm.send(remoteMessage.build());
      WritableMap res = Arguments.createMap();
      res.putString("status", "success");
      Log.d(TAG, "send: Message sent");
      callback.invoke(null, res);
    } catch (Exception e) {
      Log.e(TAG, "send: error sending message", e);
      WritableMap error = Arguments.createMap();
      error.putString("code", e.toString());
      error.putString("message", e.toString());
      callback.invoke(error);
    }
  }

  private void initSendHandler() {
    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        WritableMap params = Arguments.createMap();
        if (intent.getBooleanExtra("hasError", false)) {
          WritableMap error = Arguments.createMap();
          error.putInt("code", intent.getIntExtra("errCode", 0));
          error.putString("message", intent.getStringExtra("errorMessage"));
          params.putMap("err", error);
        } else {
          params.putNull("err");
        }
        ReactContext ctx = getReactApplicationContext();
        Utils.sendEvent(ctx, EVENT_NAME_SEND, params);
      }
    }, mReceiveSendIntentFilter);
  }
}
