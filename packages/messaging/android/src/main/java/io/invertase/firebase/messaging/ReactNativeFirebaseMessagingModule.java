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

import androidx.core.app.NotificationManagerCompat;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import java.util.HashMap;
import java.util.Map;

public class ReactNativeFirebaseMessagingModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Messaging";

  ReactNativeFirebaseMessagingModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
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
          promise.resolve(task.getResult());
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
}
