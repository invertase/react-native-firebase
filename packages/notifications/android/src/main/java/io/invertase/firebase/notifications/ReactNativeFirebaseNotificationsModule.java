package io.invertase.firebase.notifications;

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

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.util.Log;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseNotificationsModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Notifications";

  ReactNativeFirebaseNotificationsModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  /**
   * notificationId?: string;
   * title?: string;
   * subtitle?: string;
   * body: string;
   * data?: { [key: string]: string };
   * ios?: IOSNotification;
   * android?: AndroidNotification;
   * sound?: string;
   */
  @RequiresApi(api = Build.VERSION_CODES.O)
  @ReactMethod
  public void displayNotification(ReadableMap notificationRaw, Promise promise) {
    ReactNativeFirebaseNotification nativeFirebaseNotification = ReactNativeFirebaseNotification.fromReadableMap(notificationRaw);
    // TODO move me
    NotificationChannel channel = new NotificationChannel("foo1", "bar1", NotificationManager.IMPORTANCE_HIGH);
    channel.setDescription("Just a foo bar channel");
    nativeFirebaseNotification.getNotificationManager().createNotificationChannel(channel);


    // getchannel - check it exists and API level supports channels
    //   - does not exist
    //      - Reject promise

    nativeFirebaseNotification.displayNotification();
    promise.resolve(nativeFirebaseNotification.toWriteableMap());
  }

}
