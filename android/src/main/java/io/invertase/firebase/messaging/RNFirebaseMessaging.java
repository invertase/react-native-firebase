package io.invertase.firebase.messaging;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.annotation.NonNull;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v4.app.NotificationManagerCompat;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;

import io.invertase.firebase.Utils;

public class RNFirebaseMessaging extends ReactContextBaseJavaModule {
  private static final String TAG = "RNFirebaseMessaging";

  public RNFirebaseMessaging(ReactApplicationContext context) {
    super(context);
    LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(context);

    // Subscribe to message events
    localBroadcastManager.registerReceiver(new MessageReceiver(),
      new IntentFilter(RNFirebaseMessagingService.MESSAGE_EVENT));

    // Subscribe to token refresh events
    localBroadcastManager.registerReceiver(new RefreshTokenReceiver(),
      new IntentFilter(RNFirebaseInstanceIdService.TOKEN_REFRESH_EVENT));
  }

  @Override
  public String getName() {
    return "RNFirebaseMessaging";
  }

  @ReactMethod
  public void getToken(Promise promise) {
    String token = FirebaseInstanceId.getInstance().getToken();
    Log.d(TAG, "Firebase token: " + token);
    promise.resolve(token);
  }

  @ReactMethod
  public void requestPermission(Promise promise) {
    promise.resolve(null);
  }

  // Non Web SDK methods
  @ReactMethod
  public void hasPermission(Promise promise) {
    Boolean enabled = NotificationManagerCompat.from(getReactApplicationContext()).areNotificationsEnabled();
    promise.resolve(enabled);
  }

  @ReactMethod
  public void sendMessage(ReadableMap messageMap, Promise promise) {
    if (!messageMap.hasKey("to")) {
      promise.reject("messaging/invalid-message", "The supplied message is missing a 'to' field");
      return;
    }

    RemoteMessage.Builder mb = new RemoteMessage.Builder(messageMap.getString("to"));

    if (messageMap.hasKey("collapseKey")) {
      mb = mb.setCollapseKey(messageMap.getString("collapseKey"));
    }
    if (messageMap.hasKey("messageId")) {
      mb = mb.setMessageId(messageMap.getString("messageId"));
    }
    if (messageMap.hasKey("messageType")) {
      mb = mb.setMessageType(messageMap.getString("messageType"));
    }
    if (messageMap.hasKey("ttl")) {
      mb = mb.setTtl(messageMap.getInt("ttl"));
    }
    if (messageMap.hasKey("data")) {
      ReadableMap dataMap = messageMap.getMap("data");
      ReadableMapKeySetIterator iterator = dataMap.keySetIterator();
      while (iterator.hasNextKey()) {
        String key = iterator.nextKey();
        mb = mb.addData(key, dataMap.getString(key));
      }
    }

    FirebaseMessaging.getInstance().send(mb.build());

    // TODO: Listen to onMessageSent and onSendError for better feedback?
    promise.resolve(null);
  }

  @ReactMethod
  public void subscribeToTopic(String topic, final Promise promise) {
    FirebaseMessaging.getInstance().subscribeToTopic(topic).addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "subscribeToTopic:onComplete:success");
          promise.resolve(null);
        } else {
          Exception exception = task.getException();
          Log.e(TAG, "subscribeToTopic:onComplete:failure", exception);
          promise.reject(exception);
        }
      }
    });
  }

  @ReactMethod
  public void unsubscribeFromTopic(String topic, final Promise promise) {
    FirebaseMessaging.getInstance().unsubscribeFromTopic(topic).addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "unsubscribeFromTopic:onComplete:success");
          promise.resolve(null);
        } else {
          Exception exception = task.getException();
          Log.e(TAG, "unsubscribeFromTopic:onComplete:failure", exception);
          promise.reject(exception);
        }
      }
    });
  }

  private class MessageReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      if (getReactApplicationContext().hasActiveCatalystInstance()) {
        Log.d(TAG, "Received new message");

        RemoteMessage message = intent.getParcelableExtra("message");
        WritableMap messageMap = MessagingSerializer.parseRemoteMessage(message);

        Utils.sendEvent(getReactApplicationContext(), "messaging_message_received", messageMap);
      }
    }
  }

  private class RefreshTokenReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      if (getReactApplicationContext().hasActiveCatalystInstance()) {
        String token = FirebaseInstanceId.getInstance().getToken();
        Log.d(TAG, "Received new FCM token: " + token);

        Utils.sendEvent(getReactApplicationContext(), "messaging_token_refreshed", token);
      }
    }
  }
}
