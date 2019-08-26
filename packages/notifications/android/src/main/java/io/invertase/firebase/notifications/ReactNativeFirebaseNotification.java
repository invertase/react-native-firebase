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
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Objects;

import static io.invertase.firebase.app.ReactNativeFirebaseApp.getApplicationContext;

public class ReactNativeFirebaseNotification {
  private Bundle notificationBundle;
  private Bundle androidOptionsBundle;

  private ReactNativeFirebaseNotification(Bundle notificationBundle) {
    this.notificationBundle = notificationBundle;
    this.androidOptionsBundle = notificationBundle.getBundle("android");
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
    String channelId = Objects.requireNonNull(androidOptionsBundle.getString("channelId"));
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

    if (notificationBundle.containsKey("data")) {
      notificationBuilder.setExtras(notificationBundle.getBundle("data"));
    }

    if (androidOptionsBundle.containsKey("actions")) {
      ArrayList actions = androidOptionsBundle.getParcelableArrayList("actions");

      for (Object action : Objects.requireNonNull(actions)) {
//        notificationBuilder.addAction(
//          buildNotificationAction(action)
//        );
      }
    }

    if (androidOptionsBundle.containsKey("autoCancel")) {
      notificationBuilder.setAutoCancel(androidOptionsBundle.getBoolean("autoCancel"));
    }

    if (androidOptionsBundle.containsKey("badgeIconType")) {
      int badgeIconType = (int) androidOptionsBundle.getDouble("badgeIconType");
      notificationBuilder.setBadgeIconType(badgeIconType);
    }

    if (androidOptionsBundle.containsKey("category")) {
      notificationBuilder.setCategory(androidOptionsBundle.getString("category"));
    }

    if (androidOptionsBundle.containsKey("channelId") && Build.VERSION.SDK_INT >= 26) {
      NotificationChannel notificationChannel = getNotificationManager().getNotificationChannel(channelId);

      if (notificationChannel == null) {
        throw new InvalidNotificationParameterException(
          InvalidNotificationParameterException.CHANNEL_NOT_FOUND,
          String.format("Notification channel does not exist for the specified id '%s'.", channelId)
        );
      }

      // TODO do we even need to set this if its in the builder?
      notificationBuilder.setChannelId(Objects.requireNonNull(channelId));
    }

    if (androidOptionsBundle.containsKey("clickAction")) {
      // todo clickAction
    }

    if (androidOptionsBundle.containsKey("color")) {
      int color = Color.parseColor(androidOptionsBundle.getString("color"));
      notificationBuilder.setColor(color);
    }

    if (androidOptionsBundle.containsKey("colorized")) {
      notificationBuilder.setColorized(androidOptionsBundle.getBoolean("colorized"));
    }

    if (androidOptionsBundle.containsKey("contentInfo")) {
      notificationBuilder.setContentInfo(androidOptionsBundle.getString("contentInfo"));
    }

    if (androidOptionsBundle.containsKey("defaults")) {
      // todo defaults
    }

    if (androidOptionsBundle.containsKey("group")) {
      notificationBuilder.setGroup(androidOptionsBundle.getString("group"));
    }

    if (androidOptionsBundle.containsKey("groupAlertBehavior")) {
      int groupAlertBehavior = (int) androidOptionsBundle.getDouble("groupAlertBehavior");
      notificationBuilder.setGroupAlertBehavior(groupAlertBehavior);
    }

    if (androidOptionsBundle.containsKey("groupSummary")) {
      notificationBuilder.setGroupSummary(androidOptionsBundle.getBoolean("groupSummary"));
    }

    if (androidOptionsBundle.containsKey("largeIcon")) {
      // todo largeIcon
      // notificationBuilder.setLargeIcon();
    }

    if (androidOptionsBundle.containsKey("lights")) {
      ArrayList lightList = androidOptionsBundle.getParcelableArrayList("lights");
      String rawColor = (String) lightList.get(0);
      int color = Color.parseColor(rawColor);
      int onMs = (int) lightList.get(1);
      int offMs = (int) lightList.get(2);
      notificationBuilder.setLights(color, onMs, offMs);
    }

    if (androidOptionsBundle.containsKey("localOnly")) {
      notificationBuilder.setLocalOnly(androidOptionsBundle.getBoolean("localOnly"));
    }

    if (androidOptionsBundle.containsKey("number")) {
      notificationBuilder.setNumber((int) androidOptionsBundle.getDouble("number"));
    }

    if (androidOptionsBundle.containsKey("ongoing")) {
      notificationBuilder.setOngoing(androidOptionsBundle.getBoolean("ongoing"));
    }

    if (androidOptionsBundle.containsKey("onlyAlertOnce")) {
      notificationBuilder.setOnlyAlertOnce(androidOptionsBundle.getBoolean("onlyAlertOnce"));
    }

    if (androidOptionsBundle.containsKey("priority")) {
      notificationBuilder.setPriority((int) androidOptionsBundle.getDouble("priority"));
    }

    if (androidOptionsBundle.containsKey("progress")) {
      Bundle progressBundle = androidOptionsBundle.getBundle("progress");
      int max = (int) progressBundle.getDouble("max");
      int current = (int) progressBundle.getDouble("current");
      boolean indeterminate = progressBundle.getBoolean("indeterminate");
      notificationBuilder.setProgress(max, current, indeterminate);
    }

    if (androidOptionsBundle.containsKey("remoteInputHistory")) {
      // todo remoteInputHistory
    }

    if (androidOptionsBundle.containsKey("shortcutId")) {
      notificationBuilder.setShortcutId(androidOptionsBundle.getString("shortcutId"));
    }

    if (androidOptionsBundle.containsKey("showWhenTimestamp")) {
      notificationBuilder.setShowWhen(androidOptionsBundle.getBoolean("showWhenTimestamp"));
    }

    if (androidOptionsBundle.containsKey("smallIcon")) {
      ArrayList smallIconList = androidOptionsBundle.getParcelableArrayList("smallIcon");
      String smallIcon = (String) smallIconList.get(0);
      int level = (int) smallIconList.get(1);

      // todo smallIcon
      // todo get specified resource or launcher drawable (ic_launcher)
      if (level == -1) {
        notificationBuilder.setSmallIcon(R.drawable.redbox_top_border_background);
      } else {
        notificationBuilder.setSmallIcon(R.drawable.redbox_top_border_background, level);
      }
    }

    if (androidOptionsBundle.containsKey("sortKey")) {
      notificationBuilder.setSortKey(androidOptionsBundle.getString("sortKey"));
    }

    if (androidOptionsBundle.containsKey("style")) {
      Bundle styleBundle = androidOptionsBundle.getBundle("style");
      int type = (int) styleBundle.getDouble("type");
      NotificationCompat.Style style = null;

      switch (type) {
        case 0:
          style = getBigPictureStyle(styleBundle);
          break;
        case 1:
          style = getBigTextStyle(styleBundle);
          break;
      }

      if (style != null) {
        notificationBuilder.setStyle(style);
      }
    }

    if (androidOptionsBundle.containsKey("ticker")) {
      notificationBuilder.setTicker(androidOptionsBundle.getString("ticker"));
    }

    if (androidOptionsBundle.containsKey("timeoutAfter")) {
      long timeoutAfter = (long) androidOptionsBundle.getDouble("timeoutAfter");
      notificationBuilder.setTimeoutAfter(timeoutAfter);
    }

    if (androidOptionsBundle.containsKey("usesChronometer")) {
      notificationBuilder.setUsesChronometer(androidOptionsBundle.getBoolean("usesChronometer"));
    }

    if (androidOptionsBundle.containsKey("vibrate")) {
      ArrayList vibrationPattern = androidOptionsBundle.getParcelableArrayList("vibrate");
      long[] vibrateArray = new long[vibrationPattern.size()];

      for (int i = 0; i < vibrationPattern.size(); i++) {
        Integer value = (Integer) vibrationPattern.get(i);
        vibrateArray[i] = value.longValue();
      }

      notificationBuilder.setVibrate(vibrateArray);
    }

    if (androidOptionsBundle.containsKey("visibility")) {
      notificationBuilder.setVisibility((int) androidOptionsBundle.getDouble("visibility"));
    }

    if (androidOptionsBundle.containsKey("when")) {
      long when = (long) androidOptionsBundle.getDouble("when");
      notificationBuilder.setWhen(when);
    }

    return notificationBuilder.build();
  }

//  private NotificationCompat.Action buildNotificationAction(Object action) {
//    String icon = action.getString();
//
//    NotificationCompat.Action.Builder ab = new NotificationCompat.Action.Builder(
//      "foo",
//      "bar",
//      "baz"
//    );
//  }

  private NotificationCompat.BigPictureStyle getBigPictureStyle(Bundle bigPictureStyleBundle) {
    NotificationCompat.BigPictureStyle bigPictureStyle = new NotificationCompat.BigPictureStyle();

    if (bigPictureStyleBundle.containsKey("picture")) {
      // todo
      // bigPictureStyle = bigPictureStyle.bigPicture();
    }

    if (bigPictureStyleBundle.containsKey("largeIcon")) {
      // todo
    }

    if (bigPictureStyleBundle.containsKey("title")) {
      bigPictureStyle = bigPictureStyle.setBigContentTitle(bigPictureStyleBundle.getString("title"));
    }

    if (bigPictureStyleBundle.containsKey("summary")) {
      bigPictureStyle = bigPictureStyle.setSummaryText(bigPictureStyleBundle.getString("summary"));
    }

    return bigPictureStyle;
  }

  private NotificationCompat.BigTextStyle getBigTextStyle(Bundle bigTextStyleBundle) {
    NotificationCompat.BigTextStyle bigTextStyle = new NotificationCompat.BigTextStyle();

    if (bigTextStyleBundle.containsKey("text")) {
      bigTextStyle = bigTextStyle.bigText(bigTextStyleBundle.getString("text"));
    }

    if (bigTextStyleBundle.containsKey("title")) {
      bigTextStyle = bigTextStyle.setBigContentTitle(bigTextStyleBundle.getString("title"));
    }

    if (bigTextStyleBundle.containsKey("summary")) {
      bigTextStyle = bigTextStyle.setSummaryText(bigTextStyleBundle.getString("summary"));
    }

    return bigTextStyle;
  }


  public void displayNotification() {
    String notificationId = Objects.requireNonNull(notificationBundle.getString("notificationId"));

    String notificationTag = null;
    if (androidOptionsBundle.containsKey("tag")) {
      notificationTag = Objects.requireNonNull(androidOptionsBundle.getString("tag"));
    }

    getNotificationManagerCompat().notify(notificationTag, notificationId.hashCode(), getNotification());
  }

}
