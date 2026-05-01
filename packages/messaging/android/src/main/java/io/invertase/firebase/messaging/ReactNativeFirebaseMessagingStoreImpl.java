package io.invertase.firebase.messaging;

import static io.invertase.firebase.messaging.JsonConvert.jsonToReact;
import static io.invertase.firebase.messaging.JsonConvert.reactToJSON;
import static io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer.remoteMessageFromReadableMap;
import static io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import io.invertase.firebase.common.ReactNativeFirebaseMeta;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;
import io.invertase.firebase.common.UniversalFirebasePreferences;

public class ReactNativeFirebaseMessagingStoreImpl implements ReactNativeFirebaseMessagingStore {

  private static final String TAG = "RNFirebaseMsgStore";
  private static final String KEY_MAX_STORED_NOTIFICATIONS = "messaging_max_stored_notifications";
  private static final String S_KEY_ALL_NOTIFICATION_IDS = "all_notification_ids";
  private final String DELIMITER = ",";
  private static final int DEFAULT_MAX_SIZE_NOTIFICATIONS = 100;
  private static final int maxNotificationSize = resolveMaxNotificationSize();

  private static int resolveMaxNotificationSize() {
    int maxSize = DEFAULT_MAX_SIZE_NOTIFICATIONS;
    String source = "default";
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    ReactNativeFirebaseMeta meta = ReactNativeFirebaseMeta.getSharedInstance();
    ReactNativeFirebasePreferences prefs = ReactNativeFirebasePreferences.getSharedInstance();

    try {
      // Priority: SharedPreferences -> firebase.json -> AndroidManifest
      if (prefs.contains(KEY_MAX_STORED_NOTIFICATIONS)) {
        maxSize = prefs.getIntValue(KEY_MAX_STORED_NOTIFICATIONS, DEFAULT_MAX_SIZE_NOTIFICATIONS);
        source = "SharedPreferences";
      } else if (json.contains(KEY_MAX_STORED_NOTIFICATIONS)) {
        maxSize = json.getIntValue(KEY_MAX_STORED_NOTIFICATIONS, DEFAULT_MAX_SIZE_NOTIFICATIONS);
        source = "firebase.json";
      } else if (meta.contains(KEY_MAX_STORED_NOTIFICATIONS)) {
        maxSize = meta.getIntValue(KEY_MAX_STORED_NOTIFICATIONS, DEFAULT_MAX_SIZE_NOTIFICATIONS);
        source = "AndroidManifest";
      }

      Log.d(TAG, "messaging_max_stored_notifications: " + maxSize + " (from " + source + ")");
      return maxSize;
    } catch (Exception e) {
      Log.w(TAG, "Error resolving max notification size, using default: " + DEFAULT_MAX_SIZE_NOTIFICATIONS, e);
      return DEFAULT_MAX_SIZE_NOTIFICATIONS;
    }
  }

  @Override
  public void storeFirebaseMessage(RemoteMessage remoteMessage) {
    try {
      String remoteMessageString =
        reactToJSON(remoteMessageToWritableMap(remoteMessage)).toString();
      //      Log.d("storeFirebaseMessage", remoteMessageString);
      UniversalFirebasePreferences preferences = UniversalFirebasePreferences.getSharedInstance();

      // remove old notifications message before store to free space as needed
      String notificationIds = preferences.getStringValue(S_KEY_ALL_NOTIFICATION_IDS, "");
      List<String> allNotificationList = convertToArray(notificationIds);
      while (allNotificationList.size() > maxNotificationSize - 1) {
        clearFirebaseMessage(allNotificationList.get(0));
        allNotificationList.remove(0);
      }

      // now refetch the ids after possible removals, and store the new message
      notificationIds = preferences.getStringValue(S_KEY_ALL_NOTIFICATION_IDS, "");
      preferences.setStringValue(remoteMessage.getMessageId(), remoteMessageString);
      // save new notification id
      notificationIds += remoteMessage.getMessageId() + DELIMITER; // append to last
      preferences.setStringValue(S_KEY_ALL_NOTIFICATION_IDS, notificationIds);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  @Deprecated
  @Override
  public RemoteMessage getFirebaseMessage(String remoteMessageId) {
    ReadableMap messageMap = getFirebaseMessageMap(remoteMessageId);
    if (messageMap != null) {
      return remoteMessageFromReadableMap(messageMap);
    }
    return null;
  }

  @Override
  public WritableMap getFirebaseMessageMap(String remoteMessageId) {
    String remoteMessageString =
      UniversalFirebasePreferences.getSharedInstance().getStringValue(remoteMessageId, null);
    if (remoteMessageString != null) {
      //      Log.d("getFirebaseMessage", remoteMessageString);
      try {
        WritableMap remoteMessageMap = jsonToReact(new JSONObject(remoteMessageString));
        remoteMessageMap.putString("to", remoteMessageId); // fake to
        return remoteMessageMap;
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return null;
  }

  @Override
  public void clearFirebaseMessage(String remoteMessageId) {
    UniversalFirebasePreferences preferences = UniversalFirebasePreferences.getSharedInstance();
    preferences.remove(remoteMessageId).apply();
    // check and remove old notifications message
    String notificationIds = preferences.getStringValue(S_KEY_ALL_NOTIFICATION_IDS, "");
    if (!notificationIds.isEmpty()) {
      notificationIds = removeRemoteMessageId(remoteMessageId, notificationIds); // remove from list
      preferences.setStringValue(S_KEY_ALL_NOTIFICATION_IDS, notificationIds);
    }
  }

  private String removeRemoteMessageId(String remoteMessageId, String notificationIds) {
    return notificationIds.replace(remoteMessageId + DELIMITER, "");
  }

  private List<String> convertToArray(String string) {
    return new ArrayList<>(Arrays.asList(string.split(DELIMITER)));
  }
}
