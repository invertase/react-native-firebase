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

import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static io.invertase.firebase.app.ReactNativeFirebaseApp.getApplicationContext;
import static io.invertase.firebase.notifications.ReactNativeFirebaseNotificationUtils.getFileName;
import static io.invertase.firebase.notifications.ReactNativeFirebaseNotificationUtils.getSoundUri;

class ReactNativeFirebaseNotificationChannel {
  private static NotificationManager getNotificationManager() {
    return (NotificationManager) getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
  }

  static WritableMap getChannel(String channelId) {
    if (Build.VERSION.SDK_INT >= 26) {
      return createChannelMap(getNotificationManager().getNotificationChannel(channelId));
    }

    return null;
  }

  static WritableArray getChannels() {
    if (Build.VERSION.SDK_INT >= 26) {
      return createChannelsArray(getNotificationManager().getNotificationChannels());
    }

    return null;
  }

  static WritableMap getChannelGroup(String channelGroupId) {
    if (Build.VERSION.SDK_INT >= 28) {
      return createChannelGroupMap(getNotificationManager().getNotificationChannelGroup(channelGroupId));
    }

    return null;
  }

  static WritableArray getChannelGroups() {
    if (Build.VERSION.SDK_INT >= 26) {
      return createChannelGroupsArray(getNotificationManager().getNotificationChannelGroups());
    }

    return null;
  }

  static void createChannel(ReadableMap channelMap) {
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationChannel channel = parseChannelMap(channelMap);
      if (channel != null) {
        getNotificationManager().createNotificationChannel(channel);
      }
    }
  }

  static void createChannelGroup(ReadableMap channelGroupMap) {
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationChannelGroup channelGroup = parseChannelGroupMap(channelGroupMap);
      if (channelGroup != null) {
        getNotificationManager().createNotificationChannelGroup(channelGroup);
      }
    }
  }

  static void createChannelGroups(ReadableArray channelGroupsArray) {
    if (Build.VERSION.SDK_INT >= 26) {
      List<NotificationChannelGroup> channelGroups = new ArrayList<>();
      for (int i = 0; i < channelGroupsArray.size(); i++) {
        NotificationChannelGroup channelGroup = parseChannelGroupMap(channelGroupsArray.getMap(i));
        channelGroups.add(channelGroup);
      }
      getNotificationManager().createNotificationChannelGroups(channelGroups);
    }
  }

  static void createChannels(ReadableArray channelsArray) {
    if (Build.VERSION.SDK_INT >= 26) {
      List<NotificationChannel> channels = new ArrayList<>();
      for (int i = 0; i < channelsArray.size(); i++) {
        NotificationChannel channel = parseChannelMap(channelsArray.getMap(i));
        channels.add(channel);
      }
      getNotificationManager().createNotificationChannels(channels);
    }
  }

  static void deleteChannelGroup(String groupId) {
    if (Build.VERSION.SDK_INT >= 26) {
      getNotificationManager().deleteNotificationChannelGroup(groupId);
    }
  }

  static void deleteChannel(String channelId) {
    if (Build.VERSION.SDK_INT >= 26) {
      getNotificationManager().deleteNotificationChannel(channelId);
    }
  }

  @RequiresApi(api = 26)
  static private WritableArray createChannelsArray(List<NotificationChannel> notificationChannels) {
    WritableArray writableArray = Arguments.createArray();

    if (Build.VERSION.SDK_INT >= 26) {
      for (NotificationChannel notificationChannel : notificationChannels) {
        writableArray.pushMap(createChannelMap(notificationChannel));
      }
    }

    return writableArray;
  }

  @RequiresApi(api = 26)
  static private WritableArray createChannelGroupsArray(List<NotificationChannelGroup> notificationChannelGroups) {
    WritableArray writableArray = Arguments.createArray();

    if (Build.VERSION.SDK_INT >= 26) {
      for (NotificationChannelGroup notificationChannelGroup : notificationChannelGroups) {
        writableArray.pushMap(createChannelGroupMap(notificationChannelGroup));
      }
    }

    return writableArray;
  }

  @RequiresApi(api = 26)
  private static WritableMap createChannelGroupMap(NotificationChannelGroup notificationChannelGroup) {
    WritableMap writableMap = Arguments.createMap();

    if (Build.VERSION.SDK_INT >= 26) {
      writableMap.putString("groupId", notificationChannelGroup.getId());
      writableMap.putString("name", notificationChannelGroup.getName().toString());
      writableMap.putArray("channels", createChannelsArray(notificationChannelGroup.getChannels()));
      if (Build.VERSION.SDK_INT >= 28) {
        writableMap.putString("description", notificationChannelGroup.getDescription());
      }
    }

    return writableMap;
  }

  @RequiresApi(api = 26)
  private static WritableMap createChannelMap(NotificationChannel notificationChannel) {
    if (notificationChannel == null) return null;
    WritableMap writableMap = Arguments.createMap();

    if (Build.VERSION.SDK_INT >= 26) {
      writableMap.putString("channelId", notificationChannel.getId());
      writableMap.putString("name", notificationChannel.getName().toString());
      writableMap.putInt("importance", notificationChannel.getImportance());
      writableMap.putString("description", notificationChannel.getDescription());

      writableMap.putBoolean("bypassDnd", notificationChannel.canBypassDnd());
      writableMap.putString("group", notificationChannel.getGroup());
      writableMap.putString(
        "lightColor",
        String.format("#%06X", (0xFFFFFF & notificationChannel.getLightColor()))
      );
      writableMap.putBoolean("lightsEnabled", notificationChannel.shouldShowLights());

      int visibility = notificationChannel.getLockscreenVisibility();

      if (visibility == -1000) { // -1000 = not set
        writableMap.putNull("visibility");
      } else {
        writableMap.putInt("visibility", visibility);
      }

      writableMap.putBoolean("showBadge", notificationChannel.canShowBadge());
      writableMap.putString("sound", getFileName(getApplicationContext(), notificationChannel.getSound()));
      writableMap.putBoolean("vibrationEnabled", notificationChannel.shouldVibrate());

      long[] vibration = notificationChannel.getVibrationPattern();
      WritableArray vibrationArray = Arguments.createArray();
      if (vibration != null) {
        for (long aVibration : vibration) {
          vibrationArray.pushDouble(aVibration);
        }
      }
      writableMap.putArray("vibrationPattern", vibrationArray);
    }

    return writableMap;
  }

  @RequiresApi(api = 26)
  private static NotificationChannel parseChannelMap(ReadableMap channelMap) {
    if (Build.VERSION.SDK_INT >= 26) {
      String channelId = channelMap.getString("channelId");
      String name = channelMap.getString("name");
      int importance = channelMap.getInt("importance");

      NotificationChannel channel = new NotificationChannel(channelId, name, importance);

      if (channelMap.hasKey("bypassDnd")) {
        channel.setBypassDnd(channelMap.getBoolean("bypassDnd"));
      }

      if (channelMap.hasKey("description")) {
        channel.setDescription(channelMap.getString("description"));
      }

      if (channelMap.hasKey("group")) {
        channel.setGroup(channelMap.getString("group"));
      }

      if (channelMap.hasKey("lightColor")) {
        String lightColor = channelMap.getString("lightColor");
        channel.setLightColor(Color.parseColor(lightColor));
      }

      if (channelMap.hasKey("lightsEnabled")) {
        channel.enableLights(channelMap.getBoolean("lightsEnabled"));
      }

      if (channelMap.hasKey("visibility")) {
        channel.setLockscreenVisibility(channelMap.getInt("visibility"));
      }

      if (channelMap.hasKey("showBadge")) {
        channel.setShowBadge(channelMap.getBoolean("showBadge"));
      }

      if (channelMap.hasKey("sound")) {
        Uri sound = getSoundUri(channelMap.getString("sound"));
        channel.setSound(sound, null);
      }

      if (channelMap.hasKey("vibrationEnabled")) {
        channel.enableVibration(channelMap.getBoolean("vibrationEnabled"));
      }

      if (channelMap.hasKey("vibrationPattern")) {
        ReadableArray vibrationArray = Objects.requireNonNull(channelMap.getArray("vibrationPattern"));
        long[] vibration = new long[vibrationArray.size()];
        for (int i = 0; i < vibrationArray.size(); i++) {
          vibration[i] = (long) vibrationArray.getDouble(i);
        }
        channel.setVibrationPattern(vibration);
      }

      return channel;
    }

    return null;
  }

  @RequiresApi(api = 26)
  private static NotificationChannelGroup parseChannelGroupMap(ReadableMap channelGroupMap) {
    if (Build.VERSION.SDK_INT >= 26) {
      String groupId = channelGroupMap.getString("groupId");
      String name = channelGroupMap.getString("name");

      NotificationChannelGroup notificationChannelGroup = new NotificationChannelGroup(
        groupId,
        name
      );

      if (Build.VERSION.SDK_INT >= 28 && channelGroupMap.hasKey("description")) {
        String description = channelGroupMap.getString("description");
        notificationChannelGroup.setDescription(description);
      }

      return notificationChannelGroup;
    }

    return null;
  }
}
