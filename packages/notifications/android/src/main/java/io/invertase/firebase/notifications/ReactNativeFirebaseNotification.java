/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

package io.invertase.firebase.notifications;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Bundle;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.util.Objects;

import static io.invertase.firebase.app.ReactNativeFirebaseApp.getApplicationContext;

public class ReactNativeFirebaseNotification {
  private Bundle notificationBundle;
  private NotificationCompat.Builder notificationBuilder;

  private ReactNativeFirebaseNotification(Bundle notificationBundle) {
    this.notificationBundle = notificationBundle;
  }

  static ReactNativeFirebaseNotification fromBundle(Bundle bundle) {
    return new ReactNativeFirebaseNotification(bundle);
  }

  static ReactNativeFirebaseNotification fromReadableMap(ReadableMap readableMap) {
    return new ReactNativeFirebaseNotification(Arguments.toBundle(readableMap));
  }

  public WritableMap toWriteableMap() {
    return Arguments.fromBundle(notificationBundle);
  }

  public NotificationManager getNotificationManager() {
    return (NotificationManager) getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
  }

  public NotificationManagerCompat getNotificationManagerCompat() {
    return NotificationManagerCompat.from(getApplicationContext());
  }

  public Notification getNotification() {
    String channelId = Objects.requireNonNull(notificationBundle.getString("channelId"));
    NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(getApplicationContext(), channelId);

    // TODO go through all options from bundle and set on notification
    if (notificationBundle.containsKey("title")) {
      notificationBuilder.setContentTitle(notificationBundle.getString("title"));
    }

    if (notificationBundle.containsKey("subtitle")) {
      notificationBuilder.setSubText(notificationBundle.getString("subtitle"));
    }

    if (notificationBundle.containsKey("body")) {
      notificationBuilder.setContentText(notificationBundle.getString("body"));
    }

    if (notificationBundle.containsKey("channelId")) {
      notificationBuilder.setChannelId(Objects.requireNonNull(notificationBundle.getString("channelId")));
    }

    // TODO get specified resource or launcher drawable (ic_launcher)
    notificationBuilder.setSmallIcon(R.drawable.redbox_top_border_background);

    return notificationBuilder.build();
  }

  public void displayNotification() {
    String notificationId = Objects.requireNonNull(notificationBundle.getString("notificationId"));

    String notificationTag = null;
    if (notificationBundle.containsKey("tag")) {
      notificationTag = Objects.requireNonNull(notificationBundle.getString("tag"));
    }



    getNotificationManagerCompat().notify(notificationTag, notificationId.hashCode(), getNotification());
  }

}
