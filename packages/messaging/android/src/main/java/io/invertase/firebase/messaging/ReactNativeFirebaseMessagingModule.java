package io.invertase.firebase.messaging;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import android.app.Activity;
import android.content.Intent;

import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;

import java.util.HashMap;
import java.util.Map;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseMessagingModule extends ReactNativeFirebaseModule implements ActivityEventListener {
  private static final String TAG = "Messaging";
  RemoteMessage initialNotification = null;
  private HashMap<String, Boolean> initialNotificationMap = new HashMap<>();

  ReactNativeFirebaseMessagingModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
    reactContext.addActivityEventListener(this);
  }

  @ReactMethod
  public void getInitialNotification(Promise promise) {
    if (initialNotification != null) {
      promise.resolve(ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap(initialNotification));
      initialNotification = null;
      return;
    } else {
      Intent intent = getCurrentActivity().getIntent();

      if (intent != null && intent.getExtras() != null) {
        // messageId can be either one...
        String messageId = intent.getExtras().getString("google.message_id");
        if (messageId == null) messageId = intent.getExtras().getString("message_id");

        // only handle non-consumed initial notifications
        if (messageId != null && initialNotificationMap.get(messageId) == null) {
          RemoteMessage remoteMessage = ReactNativeFirebaseMessagingReceiver.notifications.get(messageId);

          if (remoteMessage != null) {
            promise.resolve(ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap(remoteMessage));
            initialNotificationMap.put(messageId, true);
            return;
          }
        }
      }
    }

    promise.resolve(null);
  }

  @ReactMethod
  public void setAutoInitEnabled(Boolean enabled, Promise promise) {
    Tasks
      .call(getExecutor(), () -> {
        FirebaseMessaging.getInstance().setAutoInitEnabled(enabled);
        return null;
      })
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(FirebaseMessaging.getInstance().isAutoInitEnabled());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void getToken(String authorizedEntity, String scope, Promise promise) {
    Tasks
      .call(getExecutor(), () -> FirebaseInstanceId.getInstance().getToken(authorizedEntity, scope))
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void deleteToken(String authorizedEntity, String scope, Promise promise) {
    Tasks
      .call(getExecutor(), () -> {
        FirebaseInstanceId.getInstance().deleteToken(authorizedEntity, scope);
        return null;
      })
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void hasPermission(Promise promise) {
    Tasks
      .call(getExecutor(), () -> NotificationManagerCompat.from(getReactApplicationContext()).areNotificationsEnabled())
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult() ? 1 : 0);
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void sendMessage(ReadableMap remoteMessageMap, Promise promise) {
    Tasks
      .call(getExecutor(), () -> {
        FirebaseMessaging.getInstance().send(ReactNativeFirebaseMessagingSerializer.remoteMessageFromReadableMap(remoteMessageMap));
        return null;
      })
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void subscribeToTopic(String topic, Promise promise) {
    FirebaseMessaging.getInstance()
      .subscribeToTopic(topic)
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @ReactMethod
  public void unsubscribeFromTopic(String topic, Promise promise) {
    FirebaseMessaging.getInstance()
      .unsubscribeFromTopic(topic)
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          rejectPromiseWithExceptionMap(promise, task.getException());
        }
      });
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
      "isAutoInitEnabled",
      FirebaseMessaging.getInstance().isAutoInitEnabled()
    );
    return constants;
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    // noop
  }

  @Override
  public void onNewIntent(Intent intent) {
    if (intent != null && intent.getExtras() != null) {
      String messageId = intent.getExtras().getString("google.message_id");
      if (messageId == null) messageId = intent.getExtras().getString("message_id");

      if (messageId != null) {
        RemoteMessage remoteMessage = ReactNativeFirebaseMessagingReceiver.notifications.get(messageId);

        if (remoteMessage != null) {
          initialNotification = remoteMessage;
          ReactNativeFirebaseMessagingReceiver.notifications.remove(messageId);

          ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
          emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.remoteMessageToEvent(remoteMessage, true));
        }
      }
    }
  }
}
