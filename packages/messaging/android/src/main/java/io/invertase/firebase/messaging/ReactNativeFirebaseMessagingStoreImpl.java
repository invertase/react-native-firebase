package io.invertase.firebase.messaging;

import static io.invertase.firebase.messaging.JsonConvert.jsonToReact;
import static io.invertase.firebase.messaging.JsonConvert.reactToJSON;
import static io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer.remoteMessageFromReadableMap;
import static io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.common.UniversalFirebasePreferences;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;

public class ReactNativeFirebaseMessagingStoreImpl implements ReactNativeFirebaseMessagingStore {

  private static final String S_KEY_ALL_NOTIFICATION_IDS = "all_notification_ids";
  private static final int MAX_SIZE_NOTIFICATIONS = 100;
  private final String DELIMITER = ",";

  @Override
  public void storeFirebaseMessage(RemoteMessage remoteMessage) {
    try {
      String remoteMessageString =
          reactToJSON(remoteMessageToWritableMap(remoteMessage)).toString();
      //      Log.d("storeFirebaseMessage", remoteMessageString);
      UniversalFirebasePreferences preferences = UniversalFirebasePreferences.getSharedInstance();
      preferences.setStringValue(remoteMessage.getMessageId(), remoteMessageString);
      // save new notification id
      String notifications = preferences.getStringValue(S_KEY_ALL_NOTIFICATION_IDS, "");
      notifications += remoteMessage.getMessageId() + DELIMITER; // append to last

      // check and remove old notifications message
      List<String> allNotificationList = convertToArray(notifications);
      if (allNotificationList.size() > MAX_SIZE_NOTIFICATIONS) {
        String firstRemoteMessageId = allNotificationList.get(0);
        preferences.remove(firstRemoteMessageId);
        notifications = removeRemoteMessage(firstRemoteMessageId, notifications);
      }
      preferences.setStringValue(S_KEY_ALL_NOTIFICATION_IDS, notifications);
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
    preferences.remove(remoteMessageId);
    // check and remove old notifications message
    String notifications = preferences.getStringValue(S_KEY_ALL_NOTIFICATION_IDS, "");
    if (!notifications.isEmpty()) {
      notifications = removeRemoteMessage(remoteMessageId, notifications); // remove from list
      preferences.setStringValue(S_KEY_ALL_NOTIFICATION_IDS, notifications);
    }
  }

  private String removeRemoteMessage(String remoteMessageId, String notifications) {
    return notifications.replace(remoteMessageId + DELIMITER, "");
  }

  private List<String> convertToArray(String string) {
    return new ArrayList<>(Arrays.asList(string.split(DELIMITER)));
  }
}
